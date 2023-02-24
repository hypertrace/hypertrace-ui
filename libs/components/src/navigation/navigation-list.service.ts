import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HtRoute, NavigationService } from '@hypertrace/common';
import { uniq } from 'lodash-es';
import { NavItemConfig, NavItemType } from './navigation.config';

@Injectable({ providedIn: 'root' })
export class NavigationListService {
  public constructor(private readonly navigationService: NavigationService) {}

  public decorateNavItem(navItem: NavItemConfig, activatedRoute: ActivatedRoute): NavItemConfig {
    if (navItem.type !== NavItemType.Link) {
      return { ...navItem };
    }
    const features = navItem.matchPaths
      .map(path => this.navigationService.getRouteConfig([path], activatedRoute))
      .filter((maybeRoute): maybeRoute is HtRoute => maybeRoute !== undefined)
      .flatMap(route => this.getFeaturesForRoute(route))
      .concat(navItem.features || []);

    return {
      ...navItem,
      features: uniq(features)
    };
  }

  private getFeaturesForRoute(route: HtRoute): string[] {
    return (route.data && route.data.features) || [];
  }
}
