import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Breadcrumb, forkJoinSafeEmpty, NavigationService, ReplayObservable } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { concat, defer, EMPTY, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, toArray } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BreadcrumbsService<T extends Breadcrumb = Breadcrumb> {
  public readonly breadcrumbs$: ReplayObservable<T[]>;

  public constructor(private readonly navigationService: NavigationService) {
    this.breadcrumbs$ = concat(
      defer(() => of(this.navigationService.getCurrentActivatedRoute())),
      this.navigationService.navigation$
    ).pipe(
      switchMap(route => this.buildBreadcrumbs(route.snapshot)),
      shareReplay(1)
    );
  }

  private buildBreadcrumbs(activatedRoute: ActivatedRouteSnapshot): Observable<T[]> {
    const breadcrumbRoutes = activatedRoute.pathFromRoot
      .filter(activatedRouteSnapshot => this.hasUrlSegment(activatedRouteSnapshot))
      .filter(activatedRouteSnapshot => this.hasBreadcrumb(activatedRouteSnapshot));

    return forkJoinSafeEmpty(
      breadcrumbRoutes.map(activatedRouteSnapshot => this.mapBreadcrumbs(activatedRouteSnapshot))
    ).pipe(
      map(breadcrumbs => breadcrumbs.flat()),
      map(breadcrumbs => (breadcrumbs.some(breadcrumb => breadcrumb.hide) ? [] : breadcrumbs))
    );
  }

  private hasUrlSegment(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    return activatedRouteSnapshot.url.length > 0;
  }

  private hasBreadcrumb(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    return !isEmpty(activatedRouteSnapshot.data) && !isEmpty(activatedRouteSnapshot.data.breadcrumb);
  }

  private mapBreadcrumbs(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<T[]> {
    return this.getBreadcrumb(activatedRouteSnapshot).pipe(
      catchError(() => {
        // If we fail to resolve a breadcrumb, that page doesn't have the appropriate data to load. Treat as error.
        this.navigationService.navigateToErrorPage();

        return EMPTY;
      }),
      map(breadcrumb => {
        if (breadcrumb.url === undefined) {
          breadcrumb.url = this.getPath(activatedRouteSnapshot);
        }

        return breadcrumb;
      }),
      toArray()
    );
  }

  private getBreadcrumb(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<T> {
    if (activatedRouteSnapshot.data.breadcrumb instanceof Observable) {
      return activatedRouteSnapshot.data.breadcrumb;
    }

    return of(activatedRouteSnapshot.data.breadcrumb);
  }

  public getPath(activatedRouteSnapshot: ActivatedRouteSnapshot): string[] {
    return activatedRouteSnapshot.pathFromRoot
      .flatMap(routeSnapshot => routeSnapshot.url)
      .flatMap(urlSegment => urlSegment.path);
  }
}
