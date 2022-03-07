import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { FeatureState, FeatureStateResolver, PreferenceService } from '@hypertrace/common';
import { NavigationListService, NavItemConfig, NavItemType } from '@hypertrace/components';
import { ObservabilityIconType } from '@hypertrace/observability';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ht-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./navigation.component.scss'],
  template: `
    <div class="navigation">
      <ht-navigation-list
        [navItems]="this.navItems"
        *htLetAsync="this.isCollapsed$ as isCollapsed"
        [collapsed]="isCollapsed"
        (collapsedChange)="this.onViewToggle($event)"
        [usePageLevelTimeRange]="this.usePageLevelTimeRange$ | async"
      ></ht-navigation-list>
    </div>
  `
})
export class NavigationComponent {
  private static readonly COLLAPSED_PREFERENCE: string = 'app-navigation.collapsed';
  public readonly navItems: NavItemConfig[];
  public readonly isCollapsed$: Observable<boolean>;
  public usePageLevelTimeRange$: Observable<boolean>;

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
    private readonly activatedRoute: ActivatedRoute,
    private readonly featureStateResolver: FeatureStateResolver
  ) {
    this.navItems = this.navItemDefinitions.map(definition =>
      this.navigationListService.decorateNavItem(definition, this.activatedRoute)
    );
    this.isCollapsed$ = this.preferenceService.get(NavigationComponent.COLLAPSED_PREFERENCE, false);

    this.usePageLevelTimeRange$ = this.featureStateResolver
      .getFeatureState(PageTimeRangeFeature.PageTimeRange)
      .pipe(map(featureState => featureState === FeatureState.Enabled));
  }

  public onViewToggle(collapsed: boolean): void {
    this.preferenceService.set(NavigationComponent.COLLAPSED_PREFERENCE, collapsed);
  }
}

export const enum PageTimeRangeFeature {
  PageTimeRange = 'ui.page-time-range'
}
