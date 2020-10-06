import { Location } from '@angular/common';
import { Router, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { patchRouterNavigateForTest } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { NavigationService } from './navigation.service';

describe('Navigation Service', () => {
  const firstChildRouteConfig = {
    path: 'child',
    children: []
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
    providers: [mockProvider(Location)],
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: 'root',
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
        // tslint:disable-next-line: no-null-keyword
        queryParams: { time: null },
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
        // tslint:disable-next-line: no-null-keyword
        queryParams: { time: null },
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
        // tslint:disable-next-line: no-null-keyword
        queryParams: { time: null },
        relativeTo: undefined
      })
    });
  });
});
