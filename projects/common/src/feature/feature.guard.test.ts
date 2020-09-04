import { Router, UrlSegment, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { patchRouterNavigateForTest, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { TraceRoute } from '../navigation/trace-route';
import { FeatureGuard } from './feature.guard';
import { FeatureStateResolver } from './state/feature-state.resolver';
import { FeatureState } from './state/feature.state';

describe('Feature Guard', () => {
  const buildRouteForFeatures = (features: string[]): TraceRoute => ({
    data: {
      features: features
    }
  });

  const mockFeatureMap = new Map([
    ['test-feature-1', true],
    ['test-feature-2', false],
    ['test-feature-3', true]
  ]);

  const mockFeatureResolverService = new (class extends FeatureStateResolver {
    public getFeatureState(feature: string): Observable<FeatureState> {
      const featureValue = mockFeatureMap.get(feature);
      if (featureValue) {
        return of(FeatureState.Enabled);
      }

      return of(FeatureState.Disabled);
    }
  })();

  const buildService = createServiceFactory({
    service: FeatureGuard,
    providers: [
      NavigationService,
      mockProvider(GraphQlRequestService, {
        queryImmediately: () =>
          of([
            { key: 'test-feature-1', value: true },
            { key: 'test-feature-2', value: false },
            { key: 'test-feature-3', value: true }
          ])
      }),
      {
        provide: FeatureStateResolver,
        useValue: mockFeatureResolverService
      }
    ],
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: 'root',
          children: [
            { path: 'child1', children: [] },
            { path: 'child2', children: [], ...buildRouteForFeatures(['test-feature-1']) },
            { path: 'child3', children: [], ...buildRouteForFeatures(['test-feature-1', 'test-feature-3']) },
            { path: 'child4', children: [], ...buildRouteForFeatures(['test-feature-1', 'test-feature-2']) },
            { path: 'child5', children: [], ...buildRouteForFeatures(['non-existent']) }
          ]
        }
      ])
    ]
  });

  test('returns can load true for routes without feature flags or only enabled', () => {
    runFakeRxjs(({ expectObservable }) => {
      const spectator = buildService();
      expectObservable(spectator.service.canLoad({}, [])).toBe('(x|)', { x: true });
      expectObservable(
        spectator.service.canLoad(buildRouteForFeatures(['test-feature-1', 'test-feature-3']), [])
      ).toBe('(x|)', { x: true });
      expectObservable(spectator.service.canLoad(buildRouteForFeatures(['test-feature-1']), [])).toBe('(x|)', {
        x: true
      });
    });
  });

  test('returns can load false and navigates to parent if feature flag not enabled', () => {
    const getUrlTreeMock = jest.fn().mockReturnValue('mock-url');
    const navMock = jest.fn();
    const urlSegments = [new UrlSegment('parent', {}), new UrlSegment('non-existent', {})];
    const spectator = buildService({
      providers: [
        mockProvider(NavigationService, {
          getUrlTree: getUrlTreeMock,
          navigateWithinApp: navMock
        })
      ]
    });

    runFakeRxjs(({ expectObservable, flush }) => {
      expectObservable(
        spectator.service.canLoad(buildRouteForFeatures(['test-feature-1', 'test-feature-2']), urlSegments)
      ).toBe('(x|)', { x: false });
      flush();
      expect(getUrlTreeMock).toHaveBeenLastCalledWith([urlSegments[0]]);
      expect(navMock).toHaveBeenLastCalledWith(['mock-url']);

      getUrlTreeMock.mockClear();
      navMock.mockClear();

      expectObservable(spectator.service.canLoad(buildRouteForFeatures(['non-existent']), urlSegments)).toBe('(x|)', {
        x: false
      });
      flush();
      expect(getUrlTreeMock).toHaveBeenLastCalledWith([urlSegments[0]]);
      expect(navMock).toHaveBeenLastCalledWith(['mock-url']);
    });
  });

  test('returns can activate true for routes without feature flags or only enabled', () => {
    const spectator = buildService();
    patchRouterNavigateForTest(spectator);
    runFakeRxjs(({ expectObservable }) => {
      const getRouteSnapshot = (url: string) => {
        spectator.inject(Router).navigateByUrl(url);

        return spectator.inject(NavigationService).getCurrentActivatedRoute().snapshot;
      };
      expectObservable(spectator.service.canActivate(getRouteSnapshot('/root/child1'))).toBe('(x|)', { x: true });
      expectObservable(spectator.service.canActivate(getRouteSnapshot('/root/child2'))).toBe('(x|)', { x: true });
      expectObservable(spectator.service.canActivate(getRouteSnapshot('/root/child3'))).toBe('(x|)', { x: true });
    });
  });

  test("returns url tree of parent if can't activate", () => {
    const spectator = buildService();
    patchRouterNavigateForTest(spectator);
    runFakeRxjs(({ expectObservable }) => {
      const getRouteSnapshot = (url: string) => {
        spectator.inject(Router).navigateByUrl(url);

        return spectator.inject(NavigationService).getCurrentActivatedRoute().snapshot;
      };
      expectObservable(
        spectator.service
          .canActivate(getRouteSnapshot('/root/child4'))
          .pipe(map(tree => tree instanceof UrlTree && tree.toString()))
      ).toBe('(x|)', { x: '/root' });
      expectObservable(
        spectator.service
          .canActivate(getRouteSnapshot('/root/child4'))
          .pipe(map(tree => tree instanceof UrlTree && tree.toString()))
      ).toBe('(x|)', { x: '/root' });
    });
  });
});
