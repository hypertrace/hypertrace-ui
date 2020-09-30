import { Location, PlatformLocation } from '@angular/common';
import { Injectable, Type } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Event,
  NavigationEnd,
  NavigationExtras,
  ParamMap,
  Params,
  Router,
  RoutesRecognized,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, share, skip, take } from 'rxjs/operators';
import { throwIfNil } from '../utilities/lang/lang-utils';
import { Dictionary } from '../utilities/types/types';
import { TraceRoute } from './trace-route';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public readonly navigation$: Observable<ActivatedRoute> = this.event$(NavigationEnd).pipe(
    map(() => this.getCurrentActivatedRoute()),
    share()
  );

  private isFirstNavigation: boolean = true;

  public constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly platformLocation: PlatformLocation
  ) {
    this.event$(RoutesRecognized)
      .pipe(skip(1), take(1))
      .subscribe(() => (this.isFirstNavigation = false));
  }

  public addQueryParametersToUrl(newParams: QueryParamObject): Observable<boolean> {
    return this.navigateInternal([], {
      queryParams: newParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  public replaceQueryParametersInUrl(newParams: QueryParamObject): Observable<boolean> {
    return this.navigateInternal([], {
      queryParams: newParams,
      replaceUrl: true
    });
  }

  public getQueryParameter(parameterName: string, defaultValue: string): string {
    return this.currentParamMap.has(parameterName) ? this.currentParamMap.get(parameterName)! : defaultValue;
  }

  public getAllValuesForQueryParameter(parameterName: string): string[] {
    return this.currentParamMap.getAll(parameterName);
  }

  public navigateToUrl(url: string): Observable<boolean> {
    const navigationParams = this.buildNavigationParams(url)!;

    return from(this.router.navigate([navigationParams[0]], navigationParams[1]));
  }

  public buildNavigationParams(url: string): [NavigationPath, NavigationExtras] | undefined {
    if (url === '') {
      return undefined;
    }

    return this.isExternalUrl(url) ? this.buildExternalNavigationParams(url) : this.buildInternalNavigationParams(url);
  }

  private buildExternalNavigationParams(
    url: string,
    navigationType: NavigationType = NavigationType.SameWindow
  ): [NavigationPath, NavigationExtras] {
    return [
      [
        '/external',
        {
          [ExternalNavigationParams.Url]: url,
          [ExternalNavigationParams.NavigationType]: navigationType
        }
      ],
      {
        skipLocationChange: true // Don't bother showing the updated location, we're going external anyway
      }
    ];
  }

  private buildInternalNavigationParams(
    url: string,
    navigationExtras?: InternalNavigationExtras
  ): [NavigationPath, NavigationExtras] {
    return [
      url,
      {
        queryParams: navigationExtras?.queryParams ?? this.buildParamsForNavigation(),
        queryParamsHandling: navigationExtras?.queryParamsHandling,
        replaceUrl: navigationExtras?.replaceUrl,
        relativeTo: navigationExtras?.relativeTo
      }
    ];
  }

  /**
   * Navigate within the app.
   * To be used for URLs with pattern '/partial_path' or 'partial_path'
   */
  public navigateWithinApp(path: NavigationPath, navigationExtras?: WithinAppNavigationExtras): Observable<boolean> {
    const params: InternalNavigationExtras = {
      queryParams: this.buildParamsForNavigation(navigationExtras?.preserveParameters ?? []),
      relativeTo: navigationExtras?.useDefaultRelativeTo
        ? this.getCurrentActivatedRoute()
        : navigationExtras?.relativeTo
    };

    return this.navigateInternal(path, params);
  }

  /**
   * Navigate to an external URL.
   * URL should be of the form 'https://url' or 'http://url'
   */
  public navigateExternal(
    url: string,
    navigationType: NavigationType = NavigationType.SameWindow
  ): Observable<boolean> {
    const params = this.buildExternalNavigationParams(url, navigationType);

    return from(this.router.navigate(Array.isArray(params[0]) ? params[0] : [params[0]], params[1]));
  }

  public buildParamsForNavigation(preserveParameters: string[] = []): QueryParamObject {
    return ['time', ...preserveParameters].reduce<Params>(
      (paramObj, param) => ({
        ...paramObj,
        [param]: this.currentParamMap.get(param)
      }),
      {}
    );
  }

  public getCurrentActivatedRoute(): ActivatedRoute {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  }

  public isRelativePathActive(path: string[], relativeTo: ActivatedRoute = this.getCurrentActivatedRoute()): boolean {
    return this.router.isActive(this.router.createUrlTree(path, { relativeTo: relativeTo }), false);
  }

  /**
   * Gets the defined route config if available. Note that this will _not_ traverse
   * lazy loaded module boundaries, as the config for a lazy loaded module may or may
   * not be available.
   */
  public getRouteConfig(
    path: string[],
    relativeTo: ActivatedRoute = this.getCurrentActivatedRoute()
  ): TraceRoute | undefined {
    const childRoutes =
      relativeTo === this.rootRoute() ? this.router.config : relativeTo.routeConfig && relativeTo.routeConfig.children;

    return this.findRouteConfig(path, childRoutes ? childRoutes : []);
  }

  public rootRoute(): ActivatedRoute {
    return this.router.routerState.root;
  }

  public currentRouteConfig(): TraceRoute {
    return throwIfNil(this.getCurrentActivatedRoute().routeConfig);
  }

  public event$<T extends Event>(eventType: Type<T>): Observable<T> {
    return this.router.events.pipe(filter((event): event is T => event instanceof eventType));
  }

  public getUrlTree(urlSegments: UrlSegment[], queryParams?: Params): UrlTree {
    return this.router.createUrlTree(
      urlSegments.map(segment => segment.toString()),
      { queryParams: queryParams }
    );
  }

  public getUrlTreeForRouteSnapshot(routeSnapshot: ActivatedRouteSnapshot): UrlTree {
    return this.getUrlTree(
      routeSnapshot.pathFromRoot.flatMap(route => route.url),
      routeSnapshot.queryParams
    );
  }

  public getAbsoluteCurrentUrl(): string {
    // Technically bad to use platform location, but seems cleaner than using off window directly
    return this.platformLocation.href;
  }

  /**
   * Navigates back if back is a location in the app, otherwise to home
   */
  public navigateBack(): Observable<boolean> {
    if (!this.canGoBackWithoutLeavingApp()) {
      return this.navigateToHome();
    }

    this.location.back();

    return of(true);
  }

  /**
   * Returns true if the URL string starts with http:// or https://
   */
  public isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Returns true if navigating back would leave the application
   */
  public canGoBackWithoutLeavingApp(): boolean {
    return !this.isFirstNavigation;
  }

  public navigateToErrorPage(replaceUrl: boolean = true): Observable<boolean> {
    return this.navigateInternal(['error'], { replaceUrl: replaceUrl });
  }

  public navigateToHome(replaceUrl: boolean = true): Observable<boolean> {
    return this.navigateInternal(['/'], { replaceUrl: replaceUrl });
  }

  private navigateInternal(path: NavigationPath, navigationExtras: InternalNavigationExtras): Observable<boolean> {
    return from(
      this.router.navigate(Array.isArray(path) ? path : [path], {
        queryParams: navigationExtras.queryParams || this.buildParamsForNavigation(),
        queryParamsHandling: navigationExtras.queryParamsHandling,
        replaceUrl: navigationExtras.replaceUrl,
        relativeTo: navigationExtras.relativeTo
      })
    );
  }

  private findRouteConfig(path: string[], routes: TraceRoute[]): TraceRoute | undefined {
    if (path.length === 0) {
      return undefined;
    }
    const flattenedPathSegments = path.flatMap(segment => segment.split('/'));
    const nextChildRoute = this.findMatchingRoute(flattenedPathSegments[0], routes);
    if (!nextChildRoute || flattenedPathSegments.length === 1) {
      return nextChildRoute;
    }

    return this.findRouteConfig(flattenedPathSegments.slice(1), nextChildRoute.children || []);
  }

  private get currentParamMap(): ParamMap {
    return this.router.routerState.snapshot.root.queryParamMap;
  }

  private findMatchingRoute(pathSegment: string, routes: TraceRoute[]): TraceRoute | undefined {
    return routes
      .filter(
        // First, filter to anything that potentially matches
        route =>
          (route.path === pathSegment && route.pathMatch === 'full') || // Exact match
          (typeof route.path === 'string' && route.path.startsWith(pathSegment) && route.pathMatch !== 'full') || // Prefix match
          route.path === '**' || // Wildcard match
          (route.path === '' && route.pathMatch !== 'full') // Pass through
      )
      .map(
        // Now resolve any pass through matches which may or may not ultimately match
        match => (match.path === '' ? this.findMatchingRoute(pathSegment, match.children || []) : match)
      )
      .find(
        // Now take first defined match
        match => match !== undefined
      );
  }
}

export interface QueryParamObject extends Params {
  [key: string]: string | string[] | number | number[] | undefined;
}

interface InternalNavigationExtras {
  replaceUrl?: boolean;
  queryParams?: QueryParamObject;
  queryParamsHandling?: 'merge';
  relativeTo?: ActivatedRoute;
}

interface WithinAppNavigationExtras {
  preserveParameters?: string[];
  relativeTo?: ActivatedRoute;
  useDefaultRelativeTo?: boolean;
}

export const enum ExternalNavigationParams {
  Url = 'url',
  NavigationType = 'navType'
}

export const enum NavigationType {
  SameWindow = 'same_window',
  NewWindow = 'new_window'
}

export type NavigationPath = string | (string | Dictionary<string>)[];
