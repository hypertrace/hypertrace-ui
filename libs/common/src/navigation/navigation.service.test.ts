import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_TITLE } from '@hypertrace/common';
import { patchRouterNavigateForTest } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import {
  ExternalNavigationPathParams,
  ExternalNavigationWindowHandling,
  NavigationParams,
  NavigationParamsType,
  NavigationService
} from './navigation.service';

describe('Navigation Service', () => {
  const firstChildRouteConfig = {
    path: 'child',
    children: [],
    data: {
      title: 'child1'
    }
  };
  const defaultChildRouteConfig = {
    path: '**',
    children: []
  };
  const secondFirstChildRouteConfig = {
    path: 'second-first',
    children: [defaultChildRouteConfig]
  };
  const passThroughRouteConfig = {
    path: '',
    children: [secondFirstChildRouteConfig]
  };
  const secondSecondChildRouteConfig = {
    path: 'second-second',
    children: []
  };
  const secondChildRouteConfig = {
    path: 'second',
    children: [passThroughRouteConfig, secondSecondChildRouteConfig]
  };

  let spectator: SpectatorService<NavigationService>;
  let router: Router;

  const buildService = createServiceFactory({
    service: NavigationService,
    providers: [
      mockProvider(Location),
      mockProvider(Title, { setTitle: jest.fn().mockReturnValue(undefined) }),
      { provide: APP_TITLE, useValue: 'defaultAppTitle' }
    ],
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: 'root',
          data: { features: ['test-feature'] },
          children: [firstChildRouteConfig, secondChildRouteConfig]
        }
      ])
    ]
  });

  beforeEach(() => {
    spectator = buildService();
    patchRouterNavigateForTest(spectator);
    router = spectator.inject(Router);
  });
  test('can retrieve a route config relative to the current route', () => {
    router.navigate(['root']);
    expect(spectator.service.getRouteConfig(['child'])).toEqual(firstChildRouteConfig);
  });

  test('can retrieve a route config relative to the root route', () => {
    expect(spectator.service.getRouteConfig(['root', 'child'], spectator.service.rootRoute())).toEqual(
      firstChildRouteConfig
    );
  });

  test('can retrieve a wildcard route config relative to the current route', () => {
    router.navigate(['root']);
    expect(spectator.service.getRouteConfig(['second', 'second-first', 'something'])).toEqual(defaultChildRouteConfig);
  });

  test('can skip a non matching pass through route config', () => {
    router.navigate(['root']);
    expect(spectator.service.getRouteConfig(['second', 'second-second'])).toEqual(secondSecondChildRouteConfig);
  });

  test('can flatten and match a multisegment path', () => {
    router.navigate(['root']);
    expect(spectator.service.getRouteConfig(['second/second-second'])).toEqual(secondSecondChildRouteConfig);
  });

  test('can build a url tree from segments', () => {
    const path = [new UrlSegment('first', { m1: 'm1v', m2: 'm2v' }), new UrlSegment('second', {})];

    expect(spectator.service.getUrlTree(path, { q1: 'q1v', q2: 'q2v' }).toString()).toBe(
      `/first${encodeURIComponent(';m1=m1v;m2=m2v')}/second?q1=q1v&q2=q2v`
    );

    expect(spectator.service.getUrlTree(path).toString()).toBe(`/first${encodeURIComponent(';m1=m1v;m2=m2v')}/second`);
  });

  test('can build a url tree from activated route snapshot', () => {
    router.navigate(['root', 'child'], { queryParams: { q1: 'q1v' } });
    expect(
      spectator.service.getUrlTreeForRouteSnapshot(spectator.service.getCurrentActivatedRoute().snapshot).toString()
    ).toBe(`/root/child?q1=q1v`);
  });

  test('back navigates to root if called on first route', () => {
    router.navigate = jest.fn().mockResolvedValue(true);
    spectator.service.navigateBack();
    expect(router.navigate).toHaveBeenCalledWith(['/'], expect.objectContaining({ replaceUrl: true }));
    expect(spectator.inject(Location).back).not.toHaveBeenCalled();
  });

  test('back navigates back in history if not first route', () => {
    router.navigate(['root', 'child']);
    router.navigate(['/root']);
    router.navigate = jest.fn();
    spectator.service.navigateBack();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(spectator.inject(Location).back).toHaveBeenCalled();
  });

  test('determines whether back would leave the application', () => {
    // Before initial nav
    expect(spectator.service.canGoBackWithoutLeavingApp()).toBe(false);
    router.navigate(['root', 'child']);
    expect(spectator.service.canGoBackWithoutLeavingApp()).toBe(false);
    router.navigate(['/root']);
    expect(spectator.service.canGoBackWithoutLeavingApp()).toBe(true);
  });

  test('can manipulate query parameters in the url', () => {
    router.navigate(['root'], { queryParams: { q1: 'q1v' } });
    expect(router.url).toContain('?q1=q1v');
    spectator.service.addQueryParametersToUrl({ q2: 'q2v' });
    expect(router.url).toContain('?q1=q1v&q2=q2v');
    spectator.service.replaceQueryParametersInUrl({ q3: 'q3v' });
    expect(router.url).toContain('?q3=q3v');
  });

  test('can navigate to error page', () => {
    router.navigate = jest.fn().mockResolvedValue(true);
    spectator.service.navigateToErrorPage();
    expect(router.navigate).toHaveBeenCalledWith(['error'], expect.objectContaining({ replaceUrl: true }));
  });

  test('can run an absolute navigation', () => {
    router.navigate = jest.fn().mockResolvedValue(true);
    spectator.service.navigateWithinApp(['root', 'child']);
    expect(router.navigate).toHaveBeenCalledWith(
      ['root', 'child'],
      expect.objectContaining({
        relativeTo: undefined
      })
    );
  });

  test('can do relative navigation', () => {
    router.navigate = jest.fn().mockResolvedValue(true);
    spectator.service.navigateWithinApp(['root']);
    spectator.service.navigateWithinApp(['child'], spectator.service.getCurrentActivatedRoute(), []);
    expect(router.navigate).toHaveBeenLastCalledWith(
      ['child'],
      expect.objectContaining({
        relativeTo: spectator.service.getCurrentActivatedRoute()
      })
    );
  });

  test('can navigate to a URL correctly', () => {
    expect(spectator.service.isExternalUrl('https://test.hypertrace.ai')).toBeTruthy();
    expect(spectator.service.isExternalUrl('http://test.hypertrace.ai')).toBeTruthy();
    expect(spectator.service.isExternalUrl('/test')).not.toBeTruthy();
    expect(spectator.service.isExternalUrl('test')).not.toBeTruthy();
  });

  test('can route to an external URL', () => {
    router.navigate = jest.fn().mockResolvedValue(true);
    spectator.service.navigate('https://www.google.com');
    expect(router.navigate).toHaveBeenCalledWith(
      [
        '/external',
        {
          url: 'https://www.google.com',
          windowHandling: 'same_window'
        }
      ],
      expect.objectContaining({ skipLocationChange: true })
    );
  });

  test('builds navigation Params correctly', () => {
    expect(spectator.service.buildNavigationParams('https://www.google.com')).toEqual({
      path: [
        '/external',
        {
          url: 'https://www.google.com',
          windowHandling: 'same_window'
        }
      ],
      extras: { skipLocationChange: true }
    });

    expect(spectator.service.buildNavigationParams('/services')).toEqual({
      path: '/services',
      extras: expect.objectContaining({
        relativeTo: undefined
      })
    });
  });

  test('can run navigation with location replace', () => {
    router.navigate = jest.fn().mockResolvedValue(true);
    spectator.service.navigate({
      navType: NavigationParamsType.InApp,
      path: ['root', 'child'],
      replaceCurrentHistory: true
    });
    expect(router.navigate).toHaveBeenCalledWith(
      ['root', 'child'],
      expect.objectContaining({
        replaceUrl: true
      })
    );
  });

  test('propagates global query params', () => {
    spectator.service.navigate({
      navType: NavigationParamsType.InApp,
      path: 'root',
      queryParams: {
        global: 'foo',
        other: 'bar'
      }
    });

    spectator.service.registerGlobalQueryParamKey('global');

    spectator.service.navigate('root/child');

    expect(spectator.service.getCurrentActivatedRoute().snapshot.url).toEqual([
      expect.objectContaining({ path: 'child' })
    ]);
    expect(spectator.service.getCurrentActivatedRoute().snapshot.queryParams).toEqual({ global: 'foo' });
  });

  test('construct external url in case useGlobalParams is set to true', () => {
    const externalNavigationParams: NavigationParams = {
      navType: NavigationParamsType.External,
      useGlobalParams: true,
      url: '/some/internal/path/of/app',
      windowHandling: ExternalNavigationWindowHandling.NewWindow
    };

    spectator.service.addQueryParametersToUrl({ time: '1h', environment: 'development' });
    spectator.service.registerGlobalQueryParamKey('time');
    spectator.service.registerGlobalQueryParamKey('environment');

    externalNavigationParams.useGlobalParams = true;

    expect(Array.isArray(spectator.service.buildNavigationParams(externalNavigationParams).path)).toBe(true);
    expect(spectator.service.buildNavigationParams(externalNavigationParams).path[1]).toHaveProperty(
      ExternalNavigationPathParams.Url
    );

    let pathParam = spectator.service.buildNavigationParams(externalNavigationParams).path[1];
    expect(typeof pathParam).not.toBe('string');

    if (typeof pathParam !== 'string') {
      expect(pathParam[ExternalNavigationPathParams.Url]).toBe(
        `${externalNavigationParams.url}?time=1h&environment=development`
      );
    }

    externalNavigationParams.url = '/some/internal/path/of/app?type=json';

    expect(Array.isArray(spectator.service.buildNavigationParams(externalNavigationParams).path)).toBe(true);
    expect(spectator.service.buildNavigationParams(externalNavigationParams).path[1]).toHaveProperty(
      ExternalNavigationPathParams.Url
    );

    pathParam = spectator.service.buildNavigationParams(externalNavigationParams).path[1];
    expect(typeof pathParam).not.toBe('string');

    if (typeof pathParam !== 'string') {
      expect(pathParam[ExternalNavigationPathParams.Url]).toBe(
        `/some/internal/path/of/app?type=json&time=1h&environment=development`
      );
    }
  });

  test('setting title should work as expected', () => {
    router.navigate(['root', 'child']);
    expect(spectator.inject(Title).setTitle).toHaveBeenCalledWith('defaultAppTitle | child1');

    router.navigate(['root']);
    expect(spectator.inject(Title).setTitle).toHaveBeenCalledWith('defaultAppTitle');
  });
});
