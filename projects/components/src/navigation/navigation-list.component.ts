import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import {
  FeatureState,
  FeatureStateResolver,
  FixedTimeRange,
  NavigationService,
  RelativeTimeRange,
  TimeRangeService
} from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { ApplicationFeature } from '../../../../src/app/shared/constants/application-feature';
import { IconSize } from '../icon/icon-size';
import { NavigationListComponentService } from './navigation-list-component.service';
import { FooterItemConfig, NavItemConfig, NavItemLinkConfig, NavItemType } from './navigation.config';

@Component({
  selector: 'ht-navigation-list',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navigation-list" [ngClass]="{ expanded: !this.collapsed }">
      <div class="content" [htLayoutChangeTrigger]="this.collapsed">
        <ng-container *ngFor="let item of this.navItems$ | async; let id = index">
          <ng-container [ngSwitch]="item.type">
            <div *ngIf="!this.collapsed">
              <ng-container *ngSwitchCase="'${NavItemType.Header}'">
                <div *ngIf="item.isVisible$ | async" class="nav-header">
                  <div class="label">{{ item.label }}</div>
                  <ht-beta-tag *ngIf="item.isBeta" class="beta"></ht-beta-tag>
                </div>
              </ng-container>
            </div>

            <hr *ngSwitchCase="'${NavItemType.Divider}'" class="nav-divider" />

            <ng-container *ngSwitchCase="'${NavItemType.Link}'">
              <ht-nav-item
                (navItemSelected)="onNavItemSelected($event)"
                [config]="item"
                [active]="(this.activeItem$ | async)?.matchPaths[0] === item.matchPaths[0]"
                [collapsed]="this.collapsed"
              ></ht-nav-item>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>

      <div class="resize-tab-button" (click)="this.toggleView()" *ngIf="this.resizable">
        <ht-icon class="resize-icon" [icon]="this.getResizeIcon()" size="${IconSize.Small}"></ht-icon>
      </div>

      <div class="footer" *ngIf="this.footerItems">
        <hr class="nav-divider" />

        <div *ngFor="let footerItem of footerItems" class="footer-item">
          <ht-link class="link" [paramsOrUrl]="footerItem.url">
            <ht-icon *ngIf="this.collapsed" [icon]="footerItem.icon" size="${IconSize.Small}"></ht-icon>
            <ht-label *ngIf="!this.collapsed" [label]="footerItem.label"></ht-label>
          </ht-link>
        </div>
      </div>
    </nav>
  `
})
export class NavigationListComponent implements OnChanges {
  @Input()
  public navItems: NavItemConfig[] = [];

  @Input()
  public footerItems?: FooterItemConfig[];

  @Input()
  public collapsed?: boolean = false;

  @Input()
  public resizable?: boolean = true;

  @Output()
  public readonly collapsedChange: EventEmitter<boolean> = new EventEmitter();

  public usePageLevelTimeRange: boolean = false;

  public activeItem$?: Observable<NavItemLinkConfig | undefined>;

  public navItems$?: Observable<NavItemConfig[]>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly navListComponentService: NavigationListComponentService,
    private readonly timeRangeService: TimeRangeService,
    private readonly featureStateResolver: FeatureStateResolver
  ) {}

  public ngOnChanges(): void {
    this.navItems = this.navListComponentService.resolveFeaturesAndUpdateVisibilityForNavItems(this.navItems);

    this.navItems$ = this.featureStateResolver
      .getCombinedFeatureState([ApplicationFeature.PageTimeRange, ApplicationFeature.NavigationRedesign])
      .pipe(
        map(featureState => featureState === FeatureState.Enabled),
        tap(usePageLevelTimeRange => {
          this.usePageLevelTimeRange = usePageLevelTimeRange;

          return usePageLevelTimeRange;
        }),
        switchMap(usePageLevelTimeRange => {
          if (usePageLevelTimeRange) {
            return this.navListComponentService.resolveNavItemConfigTimeRanges(this.navItems);
          }

          return of(this.navItems);
        })
      );

    this.activeItem$ = this.navigationService.navigation$.pipe(
      startWith(this.navigationService.getCurrentActivatedRoute()),
      map(() => this.findActiveItem(this.navItems))
    );
  }

  public toggleView(): void {
    if (this.resizable) {
      this.collapsed = !this.collapsed;
      this.collapsedChange.emit(this.collapsed);
    }
  }

  public getResizeIcon(): IconType {
    return this.collapsed ? IconType.TriangleRight : IconType.TriangleLeft;
  }

  public onNavItemSelected(navItemLink: NavItemLinkConfig): void {
    if (this.usePageLevelTimeRange && !isNil(navItemLink.timeRange)) {
      if (navItemLink.timeRange?.isCustom()) {
        const timeRange: FixedTimeRange = navItemLink.timeRange;
        this.timeRangeService.setFixedRange(timeRange.startTime, timeRange.endTime);
      } else if (!navItemLink.timeRange?.isCustom()) {
        const timeRange: RelativeTimeRange = navItemLink.timeRange as RelativeTimeRange;
        this.timeRangeService.setRelativeRange(timeRange.duration.value, timeRange.duration.unit);
      }
    }
  }

  private findActiveItem(navItems: NavItemConfig[]): NavItemLinkConfig | undefined {
    return navItems
      .filter((item): item is NavItemLinkConfig => item.type === NavItemType.Link)
      .find(linkItem =>
        linkItem.matchPaths.some(matchPath =>
          this.navigationService.isRelativePathActive([matchPath], this.activatedRoute)
        )
      );
  }
}
