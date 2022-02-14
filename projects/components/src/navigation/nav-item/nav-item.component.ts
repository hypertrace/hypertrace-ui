import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FeatureState,
  NavigationParams,
  NavigationParamsType,
  NavigationService,
  PageTimeRangeService,
  QueryParamObject,
  TimeRange,
  TimeRangeService,
  TypedSimpleChanges
} from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IconSize } from '../../icon/icon-size';
import { NavItemLinkConfig } from '../navigation.config';

@Component({
  selector: 'ht-nav-item',
  styleUrls: ['./nav-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-link *ngIf="this.config" [paramsOrUrl]="this.buildNavigationParam(this.config)">
      <div
        *htIfFeature="this.config.featureState$ | async as featureState"
        class="nav-item"
        [ngClass]="{ active: this.active }"
      >
        <ht-icon
          class="icon"
          [icon]="this.config.icon"
          size="{{ this.config.iconSize !== undefined ? this.config.iconSize : '${IconSize.Medium}' }}"
          [label]="this.config.label"
          [showTooltip]="this.collapsed"
        >
        </ht-icon>

        <div class="label-container" *ngIf="!this.collapsed">
          <span class="label">{{ this.config.label }}</span>
          <span *ngIf="featureState === '${FeatureState.Preview}'" class="soon-container">
            <span class="soon">SOON</span>
          </span>
          <ht-beta-tag *ngIf="config.isBeta" class="beta"></ht-beta-tag>
          <ht-icon
            class="trailing-icon"
            *ngIf="this.config.trailingIcon"
            [icon]="this.config.trailingIcon"
            size="{{ this.config.iconSize !== undefined ? this.config.iconSize : '${IconSize.Medium}' }}"
            [ngStyle]="{ color: this.config.trailingIconColor }"
            [htTooltip]="this.config.trailingIconTooltip"
          >
          </ht-icon>
        </div>
      </div>
    </ht-link>
  `
})
export class NavItemComponent implements OnDestroy, OnChanges {
  private static readonly TIME_RANGE_QUERY_PARAM: string = 'time';
  private readonly destroyed$: Subject<void> = new Subject();
  private timeRangeQueryParam: QueryParamObject = { [NavItemComponent.TIME_RANGE_QUERY_PARAM]: undefined };

  @Input()
  public config!: NavItemLinkConfig;

  @Input()
  public active: boolean = true;

  @Input()
  public collapsed: boolean = true;

  public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService,
    private readonly pageTimeRangeService: PageTimeRangeService,
    private readonly cd: ChangeDetectorRef
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.config) {
      this.pageTimeRangeService
        .getPageTimeRange(this.config.matchPaths[0])
        .pipe(takeUntil(this.destroyed$))
        .subscribe(timeRange => {
          if (isNil(timeRange)) {
            this.pageTimeRangeService.setPageTimeRange(this.config.matchPaths[0], this.getDefaultPageTimeRange());
          } else {
            this.timeRangeQueryParam = {
              ...this.timeRangeQueryParam,
              [NavItemComponent.TIME_RANGE_QUERY_PARAM]: timeRange.toUrlString()
            };
            this.cd.markForCheck();
            this.cd.detectChanges();
          }
        });
    }
  }

  public buildNavigationParam(item: NavItemLinkConfig): NavigationParams {
    return {
      navType: NavigationParamsType.InApp,
      path: item.matchPaths[0],
      relativeTo: this.activatedRoute,
      queryParams: this.timeRangeQueryParam,
      replaceCurrentHistory: item.replaceCurrentHistory
    };
  }

  public getDefaultPageTimeRange(): TimeRange {
    const defaultTimeRange = this.navigationService.getRouteConfig(
      [this.config.matchPaths[0]],
      this.navigationService.rootRoute()
    )?.data?.defaultTimeRange;

    if (!defaultTimeRange) {
      //  Use current time range as default default
      return this.timeRangeService.getCurrentTimeRange();
    }

    return defaultTimeRange;
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
