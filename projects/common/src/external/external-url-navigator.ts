import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  ExternalNavigationPathParams,
  ExternalNavigationWindowHandling,
  NavigationService
} from '../navigation/navigation.service';
import { assertUnreachable } from '../utilities/lang/lang-utils';
import { EXTERNAL_URL_CONSTANTS, ExternalUrlConstants } from '../constants/external-url-constants';
import { isEmpty } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class ExternalUrlNavigator implements CanActivate {
  public constructor(
    @Inject(EXTERNAL_URL_CONSTANTS) private readonly externalUrlConstants: ExternalUrlConstants,
    private readonly navService: NavigationService
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const encodedUrl = route.paramMap.get(ExternalNavigationPathParams.Url) ?? '';
    const windowHandling = route.paramMap.has(ExternalNavigationPathParams.WindowHandling)
      ? (route.paramMap.get(ExternalNavigationPathParams.WindowHandling) as ExternalNavigationWindowHandling)
      : undefined;
    if (!isEmpty(encodedUrl) && this.isExternalUrlNavigable(encodedUrl)) {
      this.navigateToUrl(encodedUrl, windowHandling);
    } else {
      this.navService.navigateToErrorPage();
    }

    return of(false); // Can't navigate, but we've already navigated anyway
  }

  /**
   * An external URL is navigable,
   *  If it is present in the defined enumerated external URL list
   *  Or If the domain is present in the defined domain allow list
   *  Or If it is related to the current app-domain
   */
  private isExternalUrlNavigable(url: string): boolean {
    let correctUrl: string = '';

    // Check whether given url is a correct url or not.
    try {
      new URL(url);
      correctUrl = url;
    } catch {
      correctUrl = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    return (
      this.externalUrlConstants.urlAllowList.includes(correctUrl) ||
      this.isExternalDomainAllowed(correctUrl) ||
      this.isCurrentAppDomain(correctUrl)
    );
  }

  private isExternalDomainAllowed(url: string): boolean {
    const hostName = new URL(url).hostname;
    const hostNameParts = hostName.split('.');
    const domain = (hostNameParts.length > 2 ? hostNameParts.slice(hostNameParts.length - 2) : hostNameParts).join('.');

    return this.externalUrlConstants.domainAllowList.includes(domain);
  }

  private isCurrentAppDomain(url: string): boolean {
    return new URL(url).hostname === window.location.hostname;
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
