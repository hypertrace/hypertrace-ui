import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import {
  ExternalNavigationPathParams,
  ExternalNavigationWindowHandling,
  NavigationService
} from '../navigation/navigation.service';
import { ExternalUrlNavigator } from './external-url-navigator';

describe('External URL navigator', () => {
  let spectator: SpectatorService<ExternalUrlNavigator>;
  const buildNavigator = createServiceFactory({
    service: ExternalUrlNavigator,
    providers: [mockProvider(NavigationService)]
  });

  beforeEach(() => {
    spectator = buildNavigator();
    window.open = jest.fn();
  });

  test('goes back when unable to detect a url on navigation', () => {
    // tslint:disable-next-line: no-object-literal-type-assertion
    spectator.service.canActivate({
      paramMap: convertToParamMap({})
    } as ActivatedRouteSnapshot);

    expect(spectator.inject(NavigationService).navigateBack).toHaveBeenCalledTimes(1);

    // tslint:disable-next-line: no-object-literal-type-assertion
    spectator.service.canActivate({
      paramMap: convertToParamMap({
        [ExternalNavigationPathParams.WindowHandling]: ExternalNavigationWindowHandling.NewWindow
      })
    } as ActivatedRouteSnapshot);

    expect(spectator.inject(NavigationService).navigateBack).toHaveBeenCalledTimes(2);
    expect(window.open).not.toHaveBeenCalled();
  });

  test('navigates when a url is provided', () => {
    // tslint:disable-next-line: no-object-literal-type-assertion
    spectator.service.canActivate({
      paramMap: convertToParamMap({ [ExternalNavigationPathParams.Url]: 'https://www.google.com' })
    } as ActivatedRouteSnapshot);

    expect(window.open).toHaveBeenNthCalledWith(1, 'https://www.google.com', '_self');

    // tslint:disable-next-line: no-object-literal-type-assertion
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
