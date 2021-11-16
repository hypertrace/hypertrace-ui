import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Color,
  FeatureState,
  HtRoute,
  NavigationService,
  NavItemDividerConfig,
  NavItemHeaderConfig,
  NavItemType
} from '@hypertrace/common';
import { uniq } from 'lodash-es';
import { Observable } from 'rxjs';
import { IconSize } from '../icon/icon-size';

@Injectable({ providedIn: 'root'})
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

export type NavItemConfig = NavItemLinkConfig | NavItemHeaderConfig | NavItemDividerConfig;

export interface NavItemLinkConfig {
  type: NavItemType.Link;
  icon: string;
  iconSize?: IconSize;
  label: string;
  matchPaths: string[]; // For now, default path is index 0
  features?: string[];
  replaceCurrentHistory?: boolean;
  isBeta?: boolean;
  trailingIcon?: string;
  trailingIconTooltip?: string;
  trailingIconColor?: Color;
  featureState$?: Observable<FeatureState>;
}
