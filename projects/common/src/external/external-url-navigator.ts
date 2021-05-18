import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
	ExternalNavigationPathParams,
	ExternalNavigationWindowHandling,
	NavigationService
} from '../navigation/navigation.service';
import { assertUnreachable } from '../utilities/lang/lang-utils';
import { getQueryParamStringFromObject } from '../utilities/url/url-utilities';

@Injectable({ providedIn: 'root' })
export class ExternalUrlNavigator implements CanActivate {
	public constructor(private readonly navService: NavigationService) { }

	public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		const url = route.paramMap.get(ExternalNavigationPathParams.Url);
		const queryParamString = getQueryParamStringFromObject(route.queryParams ?? {});
		const encodedUrl = url ? `${url}${queryParamString ? `?${queryParamString}` : ``}` : url;

		const windowHandling = route.paramMap.has(ExternalNavigationPathParams.WindowHandling)
			? (route.paramMap.get(ExternalNavigationPathParams.WindowHandling) as ExternalNavigationWindowHandling)
			: undefined;
		if (encodedUrl !== null && encodedUrl.length > 0) {
			this.navigateToUrl(encodedUrl, windowHandling);
		} else {
			this.navService.navigateBack();
		}

		return of(false); // Can't navigate, but we've already navigated anyway
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
