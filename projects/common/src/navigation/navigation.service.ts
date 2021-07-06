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
import { NavItemConfig, NavItemType } from '@hypertrace/components';
import { uniq } from 'lodash-es';
import { from, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, share, skip, startWith, switchMap, take } from 'rxjs/operators';
import { isEqualIgnoreFunctions, throwIfNil } from '../utilities/lang/lang-utils';
import { Dictionary } from '../utilities/types/types';
import { TraceRoute } from './trace-route';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public readonly navigation$: Observable<ActivatedRoute> = this.event$(NavigationEnd).pipe(
    map(() => this.getCurrentActivatedRoute()),
    share()
  );

  private isFirstNavigation: boolean = true;
  private readonly globalQueryParams: Set<string> = new Set();

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
    return this.navigate({
      navType: NavigationParamsType.InApp,
      path: [],
      queryParams: newParams,
      queryParamsHandling: 'merge',
      replaceCurrentHistory: true
    });
  }

  public replaceQueryParametersInUrl(newParams: QueryParamObject): Observable<boolean> {
    return this.navigate({
      navType: NavigationParamsType.InApp,
      path: [],
      queryParams: newParams,
      replaceCurrentHistory: true
    });
  }

  /**
   * Global query params will be preserved by default on navigation
   */
  public registerGlobalQueryParamKey(queryParamKey: string): void {
    this.globalQueryParams.add(queryParamKey);
  }

  public getQueryParameter(parameterName: string, defaultValue: string): string {
    return this.currentParamMap.has(parameterName) ? this.currentParamMap.get(parameterName)! : defaultValue;
  }

  public getAllValuesForQueryParameter(parameterName: string): string[] {
    return this.currentParamMap.getAll(parameterName);
  }

  public constructExternalUrl(urlString: string): string {
    const inputUrlTree: UrlTree = this.router.parseUrl(urlString);
    const globalQueryParams: Params = {};

    this.globalQueryParams.forEach(key => {
      const paramValue = this.getQueryParameter(key, '');
      if (paramValue !== '') {
        globalQueryParams[key] = paramValue;
      }
    });

    inputUrlTree.queryParams = { ...inputUrlTree.queryParams, ...globalQueryParams };

    return this.router.serializeUrl(inputUrlTree);
  }

  public buildNavigationParams(
    paramsOrUrl: NavigationParams | string
  ): { path: NavigationPath; extras?: NavigationExtras } {
    const params = typeof paramsOrUrl === 'string' ? this.convertUrlToNavParams(paramsOrUrl) : paramsOrUrl;

    if (params.navType === NavigationParamsType.External) {
      // External
      return {
        path: [
          '/external',
          {
            [ExternalNavigationPathParams.Url]: params.useGlobalParams
              ? this.constructExternalUrl(params.url)
              : params.url,
            [ExternalNavigationPathParams.WindowHandling]: params.windowHandling
          }
        ],
        extras: {
          skipLocationChange: true // Don't bother showing the updated location, we're going external anyway
        }
      };
    }

    // In App
    return {
      path: params.path,
      extras: {
        queryParams: params?.queryParams ?? this.buildQueryParam(),
        queryParamsHandling: params?.queryParamsHandling,
        replaceUrl: params?.replaceCurrentHistory,
        relativeTo: params?.relativeTo
      }
    };
  }

  public buildNavigationParams$(
    paramsOrUrl: NavigationParams | string
  ): Observable<{ path: NavigationPath; extras?: NavigationExtras }> {
    return this.navigation$.pipe(
      startWith(this.getCurrentActivatedRoute()),
      switchMap(route => route.queryParams),
      map(() => this.buildNavigationParams(paramsOrUrl)),
      distinctUntilChanged(isEqualIgnoreFunctions)
    );
  }

  /**
   * Navigate within the app.
   * To be used for URLs with pattern '/partial_path' or 'partial_path'
   */
  public navigateWithinApp(
    path: NavigationPath,
    relativeTo?: ActivatedRoute,
    preserveParameters?: string[]
  ): Observable<boolean> {
    return this.navigate({
      navType: NavigationParamsType.InApp,
      path: path,
      queryParams: this.buildQueryParam(preserveParameters ?? []),
      relativeTo: relativeTo
    });
  }

  private buildQueryParam(preserveParameters: string[] = []): QueryParamObject {
    return [...this.globalQueryParams, ...preserveParameters].reduce<Params>(
      (paramObj, param) => ({
        ...paramObj,
        [param]: this.currentParamMap.get(param)
      }),
      {}
    );
  }

  public navigate(paramsOrUrl: NavigationParams | string): Observable<boolean> {
    const { path, extras } = this.buildNavigationParams(paramsOrUrl);

    return from(this.router.navigate(Array.isArray(path) ? path : [path], extras));
  }

  public convertUrlToNavParams(url: string): NavigationParams {
    if (url === '') {
      throw Error('Empty Url used for navigation');
    }

    if (this.isExternalUrl(url)) {
      return {
        navType: NavigationParamsType.External,
        url: url,
        windowHandling: ExternalNavigationWindowHandling.SameWindow
      };
    }

    return {
      navType: NavigationParamsType.InApp,
      path: url
    };
  }

  public getCurrentActivatedRoute(): ActivatedRoute {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  }

  public isPathActiveAndChanges(path: string[]): Observable<boolean> {
    const urlTree = this.router.createUrlTree(path);

    return this.router.events.pipe(
      startWith(),
      map(() => this.router.isActive(urlTree, false)),
      distinctUntilChanged()
    );
  }

  public isPathActive(path: string[]): boolean {
    return this.router.isActive(this.router.createUrlTree(path), false);
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

  public decorateNavItem(navItem: NavItemConfig, activatedRoute: ActivatedRoute): NavItemConfig {
    if (navItem.type !== NavItemType.Link) {
      return { ...navItem };
    }
    const features = navItem.matchPaths
      .map(path => this.getRouteConfig([path], activatedRoute))
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

  public navigateToErrorPage(replaceCurrentHistory: boolean = true): Observable<boolean> {
    return this.navigate({
      navType: NavigationParamsType.InApp,
      path: ['error'],
      replaceCurrentHistory: replaceCurrentHistory
    });
  }

  public navigateToHome(replaceCurrentHistory: boolean = true): Observable<boolean> {
    return this.navigate({
      navType: NavigationParamsType.InApp,
      path: ['/'],
      replaceCurrentHistory: replaceCurrentHistory
    });
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

export type NavigationPath = string | (string | Dictionary<string>)[];

export type NavigationParams = InAppNavigationParams | ExternalNavigationParams;
export interface InAppNavigationParams {
  navType: NavigationParamsType.InApp;
  path: NavigationPath;
  replaceCurrentHistory?: boolean;
  queryParams?: QueryParamObject;
  queryParamsHandling?: 'merge' | 'preserve';
  relativeTo?: ActivatedRoute;
}

export interface ExternalNavigationParams {
  navType: NavigationParamsType.External;
  url: string;
  windowHandling: ExternalNavigationWindowHandling; // Currently an enum called NavigationType
  useGlobalParams?: boolean;
}

export const enum ExternalNavigationPathParams {
  Url = 'url',
  WindowHandling = 'windowHandling'
}

export const enum ExternalNavigationWindowHandling {
  SameWindow = 'same_window',
  NewWindow = 'new_window'
}

export const enum NavigationParamsType {
  InApp = 'in-app',
  External = 'external'
}
