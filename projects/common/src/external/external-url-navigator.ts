import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  ExternalNavigationPathParams,
  ExternalNavigationWindowHandling,
  NavigationService
} from '../navigation/navigation.service';
import { assertUnreachable } from '../utilities/lang/lang-utils';
import { EXTERNAL_URL_DOMAIN_ALLOWLIST } from '../constants/external-urls-allowlist';

@Injectable({ providedIn: 'root' })
export class ExternalUrlNavigator implements CanActivate {
  public constructor(
    private readonly navService: NavigationService,
    @Inject(EXTERNAL_URL_DOMAIN_ALLOWLIST) private readonly allowListedDomains: string[]
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const encodedUrl = route.paramMap.get(ExternalNavigationPathParams.Url);
    const windowHandling = route.paramMap.has(ExternalNavigationPathParams.WindowHandling)
      ? (route.paramMap.get(ExternalNavigationPathParams.WindowHandling) as ExternalNavigationWindowHandling)
      : undefined;
    if (encodedUrl !== null && encodedUrl.length > 0 && this.isExternalDomainAllowed(encodedUrl)) {
      this.navigateToUrl(encodedUrl, windowHandling);
    } else {
      this.navService.navigateToErrorPage();
    }

    return of(false); // Can't navigate, but we've already navigated anyway
  }

  private isExternalDomainAllowed(encodedUrl: string): boolean {
    const hostName = new URL(encodedUrl).hostname;
    const hostNameParts = hostName.split('.');
    const domain = (hostNameParts.length > 2 ? hostNameParts.slice(hostNameParts.length - 2) : hostNameParts).join('.');

    return this.allowListedDomains.includes(domain);
  }

  private navigateToUrl(
    url: string,
    windowHandling: ExternalNavigationWindowHandling = ExternalNavigationWindowHandling.SameWindow
  ): void {
    window.open(url, this.asWindowName(windowHandling));
  }

  private asWindowName(windowHandling: ExternalNavigationWindowHandling): string | undefined {
    switch (windowHandling) {
      case ExternalNavigationWindowHandling.SameWindow:
        return '_self';
      case ExternalNavigationWindowHandling.NewWindow:
        return undefined;
      default:
        assertUnreachable(windowHandling);
    }
  }
}
