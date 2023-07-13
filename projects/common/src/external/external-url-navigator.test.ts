import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import {
  ExternalNavigationPathParams,
  ExternalNavigationWindowHandling,
  NavigationService
} from '../navigation/navigation.service';
import { ExternalUrlNavigator } from './external-url-navigator';

describe('External URL navigator', () => {
  const buildNavigator = createServiceFactory({
    service: ExternalUrlNavigator,
    providers: [
      mockProvider(NavigationService, {
        canGoBackWithoutLeavingApp: jest.fn().mockReturnValue(true),
        firstNavigatedUrl: '/test-url'
      })
    ]
  });

  beforeEach(() => {
    window.open = jest.fn();
  });

  test('goes to error page on first navigation as external navigation', () => {
    const spectator = buildNavigator({
      providers: [
        mockProvider(NavigationService, {
          canGoBackWithoutLeavingApp: jest.fn().mockReturnValue(false),
          firstNavigatedUrl: '/external'
        })
      ]
    });
    spectator.service.canActivate({
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: 'https://www.google.com' })
    } as ActivatedRouteSnapshot);

    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalledTimes(1);
  });

  test('goes back when unable to detect a url on navigation', () => {
    const spectator = buildNavigator();

    spectator.service.canActivate({
      paramMap: convertToParamMap({})
    } as ActivatedRouteSnapshot);

    expect(spectator.inject(NavigationService).navigateBack).toHaveBeenCalledTimes(1);

    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(spectator.inject(NavigationService).navigateBack).toHaveBeenCalledTimes(2);
    expect(window.open).not.toHaveBeenCalled();
  });

  test('navigates when a url is provided', () => {
    const spectator = buildNavigator();

    spectator.service.canActivate({
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: 'https://www.google.com' })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenNthCalledWith(1, 'https://www.google.com', '_self');

    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.Url]: 'https://www.bing.com',
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenNthCalledWith(2, 'https://www.bing.com', undefined);
    expect(spectator.inject(NavigationService).navigateBack).not.toHaveBeenCalled();
  });
});
