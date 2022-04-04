import { Injectable } from '@angular/core';
import {
  ApplicationFeature,
  FeatureState,
  FeatureStateResolver,
  PageTimeRangePreferenceService
} from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NavItemConfig, NavItemHeaderConfig, NavItemLinkConfig, NavItemType } from './navigation.config';

@Injectable({ providedIn: 'root' })
export class NavigationListComponentService {
  public constructor(
    private readonly featureStateResolver: FeatureStateResolver,
    private readonly pageTimeRangePreferenceService: PageTimeRangePreferenceService
  ) {}

  public resolveFeaturesAndUpdateVisibilityForNavItems(navItems: NavItemConfig[]): NavItemConfig[] {
    const updatedItems = this.updateLinkNavItemsVisibility(navItems);
    let linkItemsForThisSection: NavItemLinkConfig[] = [];
    for (let i = updatedItems.length - 1; i >= 0; i--) {
      if (updatedItems[i].type === NavItemType.Header) {
        (updatedItems[i] as NavItemHeaderConfig).isVisible$ = this.updateHeaderNavItemsVisibility(
          linkItemsForThisSection
        );
        linkItemsForThisSection = [];
      } else if (updatedItems[i].type === NavItemType.Link) {
        linkItemsForThisSection.push(updatedItems[i] as NavItemLinkConfig);
      }
    }

    return updatedItems;
  }

  public resolveNavItemConfigTimeRanges(navItems: NavItemConfig[]): Observable<NavItemConfig[]> {
    return this.featureStateResolver
      .getFeatureState(ApplicationFeature.PageTimeRange)
      .pipe(switchMap(featureState => combineLatest(this.getTimeRangesForNavItems(navItems, featureState))));
  }

  private getTimeRangesForNavItems(
    navItems: NavItemConfig[],
    pageLevelTimeRangeFeatureState: FeatureState
  ): Observable<NavItemConfig>[] {
    return navItems.map(navItem => {
      if (navItem.type === NavItemType.Link) {
        return this.pageTimeRangePreferenceService.getTimeRangePreferenceForPage(navItem.matchPaths[0]).pipe(
          map(timeRangeResolver => ({
            ...navItem,
            timeRangeResolver: timeRangeResolver,
            pageLevelTimeRangeIsEnabled: pageLevelTimeRangeFeatureState === FeatureState.Enabled
          }))
        );
      }

      return of(navItem);
    });
  }

  private updateHeaderNavItemsVisibility(navItems: NavItemLinkConfig[]): Observable<boolean> {
    return isEmpty(navItems)
      ? of(false)
      : combineLatest(navItems.map(navItem => navItem.featureState$!)).pipe(
          map(states => states.some(state => state !== FeatureState.Disabled))
        );
  }

  private updateLinkNavItemsVisibility(navItems: NavItemConfig[]): NavItemConfig[] {
    return navItems.map(navItem => {
      if (navItem.type === NavItemType.Link) {
        return {
          ...navItem,
          featureState$: this.featureStateResolver.getCombinedFeatureState(navItem.features ?? [])
        };
      }

      return navItem;
    });
  }
}
