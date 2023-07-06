import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import {
  ExternalNavigationPathParams,
  ExternalNavigationWindowHandling,
  NavigationService
} from '../navigation/navigation.service';
import { ExternalUrlNavigator } from './external-url-navigator';
import { EXTERNAL_URL_CONSTANTS } from '../constants/external-url-constants';

describe('External URL navigator', () => {
  let spectator: SpectatorService<ExternalUrlNavigator>;
  const buildNavigator = createServiceFactory({
    service: ExternalUrlNavigator,
    providers: [
      mockProvider(NavigationService),
      {
        provide: EXTERNAL_URL_CONSTANTS,
        useValue: {
          urlAllowList: ['https://www.test.com'],
          domainAllowList: ['test123.in']
        }
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
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: 'https://www.test.com' })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenNthCalledWith(1, 'https://www.test.com', '_self');

    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.Url]: 'https://www.test456.com',
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(window.open).not.toHaveBeenCalledTimes(2);
    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalled();
  });

  test('navigates when an allowed domain url is provided', () => {
    spectator.service.canActivate({
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: 'https://www.test123.in/test' })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenNthCalledWith(1, 'https://www.test123.in/test', '_self');

    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.Url]: 'https://www.test456.com',
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(window.open).not.toHaveBeenCalledTimes(2);
    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalled();
  });

  test('navigates when an partial url is provided', () => {
    spectator.service.canActivate({
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: '/test' })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenCalled();
  });
});
