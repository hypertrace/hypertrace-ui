import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import {
  ExternalNavigationPathParams,
  ExternalNavigationWindowHandling,
  NavigationService
} from '../navigation/navigation.service';
import { ExternalUrlNavigator } from './external-url-navigator';
import { EXTERNAL_URL_DOMAIN_ALLOWLIST } from '@hypertrace/common';

describe('External URL navigator', () => {
  let spectator: SpectatorService<ExternalUrlNavigator>;
  const buildNavigator = createServiceFactory({
    service: ExternalUrlNavigator,
    providers: [
      mockProvider(NavigationService),
      {
        provide: EXTERNAL_URL_DOMAIN_ALLOWLIST,
        useValue: ['traceable.ai']
      }
    ]
  });

  beforeEach(() => {
    spectator = buildNavigator();
    window.open = jest.fn();
  });

  test('goes to error page when unable to detect a url on navigation', () => {
    spectator.service.canActivate({
      paramMap: convertToParamMap({})
    } as ActivatedRouteSnapshot);

    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalledTimes(1);

    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalledTimes(2);
    expect(window.open).not.toHaveBeenCalled();
  });

  test('navigates when an allowed url is provided', () => {
    spectator.service.canActivate({
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: 'https://www.traceable.ai' })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenNthCalledWith(1, 'https://www.traceable.ai', '_self');

    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.Url]: 'https://docs.traceable.ai',
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenNthCalledWith(2, 'https://docs.traceable.ai', undefined);
    expect(spectator.inject(NavigationService).navigateToErrorPage).not.toHaveBeenCalled();
  });

  test('navigates to error when a url for non-allowlisted domain is provided', () => {
    spectator.service.canActivate({
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: 'https://www.google.com' })
    } as ActivatedRouteSnapshot);
    expect(window.open).not.toHaveBeenCalled();
    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalled();

    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.Url]: 'https://www.bing.com',
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(window.open).not.toHaveBeenCalled();
    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalled();
  });
});
