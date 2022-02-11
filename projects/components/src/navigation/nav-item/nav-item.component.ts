import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FeatureState,
  NavigationParams,
  NavigationParamsType,
  PageTimeRangeService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { IconSize } from '../../icon/icon-size';
import { NavItemLinkConfig } from '../navigation.config';

@Component({
  selector: 'ht-nav-item',
  styleUrls: ['./nav-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-link *ngIf="this.config" [paramsOrUrl]="buildNavigationParam | htMemoize: this.config">
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
export class NavItemComponent implements OnInit {
  @Input()
  public config!: NavItemLinkConfig;

  @Input()
  public active: boolean = true;

  @Input()
  public collapsed: boolean = true;

  @HostListener('click')
  public onClick(): void {
    this.setTimeRangeForPage();
  }

  public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly timeRangeService: TimeRangeService,
    private readonly pageTimeRangeService: PageTimeRangeService
  ) {}

  public ngOnInit(): void {
    if (isNil(this.pageTimeRangeService.getPageTimeRange(this.config.matchPaths[0]))) {
      this.pageTimeRangeService.setPageTimeRange(this.config.matchPaths[0], this.buildDefaultPageTimeRange());
    }
  }

  public buildNavigationParam = (item: NavItemLinkConfig): NavigationParams => ({
    navType: NavigationParamsType.InApp,
    path: item.matchPaths[0],
    relativeTo: this.activatedRoute,
    replaceCurrentHistory: item.replaceCurrentHistory
  });

  public buildDefaultPageTimeRange(): RelativeTimeRange {
    // TODO if (isNil(this.config.defaultPageTimeRange?.value) || isNil(this.config.defaultPageTimeRange?.unit)) {
    // TODO  throw Error('Time range not provided for navigation route');
    // }
    const value: number = this.config.defaultPageTimeRange?.value ?? 1;
    const unit: TimeUnit = this.config.defaultPageTimeRange?.unit ?? TimeUnit.Hour;

    return new RelativeTimeRange(new TimeDuration(value, unit));
  }

  public setTimeRangeForPage(): void {
    const timeRange: RelativeTimeRange = this.pageTimeRangeService.getPageTimeRange(this.config.matchPaths[0])!;
    this.timeRangeService.setRelativeRange(timeRange.duration.value, timeRange.duration.unit);
  }
}
