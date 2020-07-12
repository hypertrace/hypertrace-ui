import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, TraceRoute } from '@hypertrace/common';
import { NavItemConfig, NavItemType } from '@hypertrace/components';
import { ObservabilityIconType } from '@hypertrace/observability';
import { uniq } from 'lodash';

@Component({
  selector: 'ht-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <htc-navigation-list [navItems]="this.navItems"></htc-navigation-list> `
})
export class NavigationComponent {
  public readonly navItems: NavItemConfig[];

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

  public constructor(private readonly navigationService: NavigationService) {
    this.navItems = this.navItemDefinitions.map(definition => this.decorateNavItem(definition));
  }

  private decorateNavItem(navItem: NavItemConfig): NavItemConfig {
    if (navItem.type !== NavItemType.Link) {
      return { ...navItem };
    }
    const features = navItem.matchPaths
      .map(path => this.navigationService.getRouteConfig([path], this.navigationService.rootRoute()))
      .filter((maybeRoute): maybeRoute is TraceRoute => maybeRoute !== undefined)
      .flatMap(route => this.getFeaturesForRoute(route))
      .concat(navItem.features || []);

    return {
      ...navItem,
      features: uniq(features)
    };
  }

  private getFeaturesForRoute(route: TraceRoute): string[] {
    return (route.data && route.data.features) || [];
  }
}
