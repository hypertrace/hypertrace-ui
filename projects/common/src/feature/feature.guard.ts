import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HtRoute } from '../navigation/ht-route';
import { NavigationService } from '../navigation/navigation.service';
import { FeatureStateResolver } from './state/feature-state.resolver';
import { FeatureState } from './state/feature.state';

@Injectable({ providedIn: 'root' })
export class FeatureGuard implements CanLoad, CanActivate {
  public constructor(
    private readonly navService: NavigationService,
    private readonly featureStateResolver: FeatureStateResolver
  ) {}

  public canLoad(route: HtRoute, segments: UrlSegment[]): Observable<boolean> {
    // TODO as of ng8, canLoad has been pretty neglected. Doesn't have access to query params or returning a url tree
    // Https://github.com/angular/angular/issues/30633  https://github.com/angular/angular/issues/28306
    // For now, we'll work around by ignoring query params and doing a direct redirect
    return this.checkRouteValidity(route).pipe(
      tap(loadable => {
        if (!loadable) {
          const parentUrl = this.navService.getUrlTree(segments.slice(0, -1)).toString();
          this.navService.navigateWithinApp([parentUrl]);
        }
      })
    );
  }

  public canActivate(routeSnapshot: ActivatedRouteSnapshot): Observable<true | UrlTree> {
    if (!routeSnapshot.routeConfig) {
      return of(true);
    }

    return this.checkRouteValidity(routeSnapshot.routeConfig).pipe(
      map(
        value =>
          value ||
          this.navService.getUrlTreeForRouteSnapshot(
            routeSnapshot.parent ? routeSnapshot.parent : this.navService.rootRoute().snapshot
          )
      )
    );
  }

  private checkRouteValidity(route: HtRoute): Observable<boolean> {
    return this.getCombinedFeatureState(this.getFeaturesForRoute(route)).pipe(
      catchError(() => of(FeatureState.Disabled)),
      map(state => state !== FeatureState.Disabled)
    );
  }

  private getCombinedFeatureState(features: string[]): Observable<FeatureState> {
    return this.featureStateResolver.getCombinedFeatureState(features);
  }

  private getFeaturesForRoute(route: HtRoute): string[] {
    return (route.data && route.data.features) || [];
  }
}
