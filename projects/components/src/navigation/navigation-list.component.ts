import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import {
  ApplicationFeature,
  FeatureStateResolver,
  FixedTimeRange,
  NavigationService,
  RelativeTimeRange,
  TimeRangeService,
  TypedSimpleChanges
} from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { NavigationListComponentService } from './navigation-list-component.service';
import { FooterItemConfig, NavItemConfig, NavItemLinkConfig, NavItemType } from './navigation.config';

@Component({
  selector: 'ht-navigation-list',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navigation-list" [ngClass]="{ expanded: !this.collapsed }">
      <div class="content" *htLetAsync="this.activeItem$ as activeItem" [htLayoutChangeTrigger]="this.collapsed">
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
                (click)="this.setPageTimeRangeForSelectedNavItem(item)"
                [config]="item"
                [active]="item === activeItem"
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

  public activeItem$?: Observable<NavItemLinkConfig | undefined>;

  public navItems$?: Observable<NavItemConfig[]>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly navListComponentService: NavigationListComponentService,
    private readonly timeRangeService: TimeRangeService,
    private readonly featureStateResolver: FeatureStateResolver
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.navItems) {
      this.navItems = this.navListComponentService.resolveFeaturesAndUpdateVisibilityForNavItems(this.navItems);

      // Decorate the nav items with the corresponding time ranges, depending on the FF state.
      // The time ranges in nav items are streams that get the most recent value from page time range preference service
      this.navItems$ = this.featureStateResolver
        .getCombinedFeatureState([ApplicationFeature.PageTimeRange, ApplicationFeature.NavigationRedesign])
        .pipe(
          switchMap(pageLevelTimeRangeFeature =>
            this.navListComponentService.resolveNavItemConfigTimeRanges(this.navItems, pageLevelTimeRangeFeature)
          ),
          shareReplay()
        );

      // For each nav item, find the (possibly new) active nav item
      // Time range is set on component load, when it isn't already
      // Depending on FF status, the TR will be either global or page level for the init
      this.activeItem$ = combineLatest([
        this.navItems$,
        this.navigationService.navigation$.pipe(startWith(this.navigationService.getCurrentActivatedRoute()))
      ]).pipe(
        map(([navItems]) => {
          const activeItem = this.findActiveItem(navItems);
          if (!this.timeRangeService.isInitialized() && activeItem) {
            this.timeRangeService.setDefaultTimeRange(activeItem.timeRange!);
          }

          return activeItem;
        })
      );
    }
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

  public setPageTimeRangeForSelectedNavItem(navItemLink: NavItemLinkConfig): void {
    if (!isNil(navItemLink.timeRange) && navItemLink.pageLevelTimeRangeIsEnabled) {
      if (navItemLink.timeRange instanceof FixedTimeRange) {
        const timeRange: FixedTimeRange = navItemLink.timeRange;
        this.timeRangeService.setFixedRange(timeRange.startTime, timeRange.endTime);
      } else if (navItemLink.timeRange instanceof RelativeTimeRange) {
        const timeRange: RelativeTimeRange = navItemLink.timeRange;
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
