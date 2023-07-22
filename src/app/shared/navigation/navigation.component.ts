import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { LoggerService, PageTimeRangePreferenceService, PreferenceService, TimeRangeService } from '@hypertrace/common';
import {
  NavigationListComponentService,
  NavigationListService,
  NavItemConfig,
  NavItemLinkConfig,
  NavItemType
} from '@hypertrace/components';
import { ObservabilityIconType } from '@hypertrace/observability';
import { Observable } from 'rxjs';

@Component({
  selector: 'ht-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./navigation.component.scss'],
  template: `
    <div class="navigation">
      <ht-navigation-list
        [navItems]="this.navItems$ | async"
        *htLetAsync="this.isCollapsed$ as isCollapsed"
        [collapsed]="isCollapsed"
        (collapsedChange)="this.onViewToggle($event)"
        (activeItemChange)="this.updateDefaultTimeRangeIfUnset($event)"
      ></ht-navigation-list>
    </div>
  `
})
export class NavigationComponent {
  private static readonly COLLAPSED_PREFERENCE: string = 'app-navigation.collapsed';

  public navItems$?: Observable<NavItemConfig[]>;

  public readonly isCollapsed$: Observable<boolean>;

  private readonly navItemDefinitions: NavItemConfig[] = [
    {
      type: NavItemType.Link,
      label: 'Dashboard',
      icon: IconType.Dashboard,
      matchPaths: ['home']
    },
    {
      type: NavItemType.Header,
      label: 'Monitor'
    },
    {
      type: NavItemType.Link,
      label: 'Application Flow',
      icon: ObservabilityIconType.ApplicationFlow,
      matchPaths: ['application-flow']
    },
    {
      type: NavItemType.Link,
      label: 'API Endpoints',
      icon: ObservabilityIconType.Api,
      matchPaths: ['endpoints']
    },
    {
      type: NavItemType.Link,
      label: 'Services',
      icon: ObservabilityIconType.Service,
      matchPaths: ['services']
    },
    {
      type: NavItemType.Link,
      label: 'Backends',
      icon: ObservabilityIconType.Backend,
      matchPaths: ['backends']
    },
    {
      type: NavItemType.Header,
      label: 'Investigate'
    },
    {
      type: NavItemType.Link,
      label: 'Explorer',
      icon: IconType.Search,
      matchPaths: ['explorer']
    }
  ];

  public constructor(
    private readonly navigationListService: NavigationListService,
    private readonly preferenceService: PreferenceService,
    private readonly navListComponentService: NavigationListComponentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly timeRangeService: TimeRangeService,
    private readonly pageTimeRangeService: PageTimeRangePreferenceService,
    private readonly loggerService: LoggerService
  ) {
    const navItems = this.navItemDefinitions.map(definition =>
      this.navigationListService.decorateNavItem(definition, this.activatedRoute)
    );
    // Decorate the nav items with the corresponding time ranges, depending on the FF state.
    // The time ranges in nav items are streams that get the most recent value from page time range preference service
    this.navItems$ = this.navListComponentService.resolveNavItemConfigTimeRanges(navItems);

    this.isCollapsed$ = this.preferenceService.get(NavigationComponent.COLLAPSED_PREFERENCE, false);
  }

  public updateDefaultTimeRangeIfUnset(activeItem: NavItemLinkConfig | undefined): void {
    // Initialize the time range service
    // Depending on FF status, the TR will be either global or page level for the init
    if (!this.timeRangeService.isInitialized()) {
      if (activeItem?.timeRangeResolver) {
        this.timeRangeService.setDefaultTimeRange(activeItem.timeRangeResolver());
      } else {
        // Fallback for pages that don't have/are a parent navItem page in the routes tree
        this.timeRangeService.setDefaultTimeRange(this.pageTimeRangeService.getGlobalDefaultTimeRange());
        this.loggerService.warn('Time range fallback triggered, global default time range set');
      }
    }
  }

  public onViewToggle(collapsed: boolean): void {
    this.preferenceService.set(NavigationComponent.COLLAPSED_PREFERENCE, collapsed);
  }
}
