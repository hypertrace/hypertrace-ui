import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ExternalNavigationParams, NavigationService, NavigationType } from '../navigation/navigation.service';
import { assertUnreachable } from '../utilities/lang/lang-utils';

@Injectable({ providedIn: 'root' })
export class ExternalUrlNavigator implements CanActivate {
  public constructor(private readonly navService: NavigationService) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const encodedUrl = route.paramMap.get(ExternalNavigationParams.Url);
    const navType = route.paramMap.has(ExternalNavigationParams.NavigationType)
      ? (route.paramMap.get(ExternalNavigationParams.NavigationType) as NavigationType)
      : undefined;
    if (encodedUrl !== null && encodedUrl.length > 0) {
      this.navigateToUrl(encodedUrl, navType);
    } else {
      this.navService.navigateBack();
    }

    return of(false); // Can't navigate, but we've already navigated anyway
  }

  private navigateToUrl(url: string, navigationType: NavigationType = NavigationType.SameWindow): void {
    window.open(url, this.asWindowName(navigationType));
  }

  private asWindowName(navigationType: NavigationType): string | undefined {
    switch (navigationType) {
      case NavigationType.SameWindow:
        return '_self';
      case NavigationType.NewWindow:
        return undefined;
      default:
        assertUnreachable(navigationType);
    }
  }
}
