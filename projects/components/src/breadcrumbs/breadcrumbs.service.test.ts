import { IconType } from '@hypertrace/assets-library';
import { Breadcrumb, HtRouteData, NavigationService } from '@hypertrace/common';
import { ObservabilityIconType } from '@hypertrace/observability';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { BreadcrumbsService } from './breadcrumbs.service';

describe('BreadcrumbsService', () => {
  const buildMockRoute = (path: ActivatedRouteSnapshotBuildData[]) =>
    path
      .map(route => ({
        url: route.urlSegments.map(segment => ({ path: segment })),
        data: {
          breadcrumb: route.breadcrumb
        }
      }))
      .map((value, index, array) => {
        const routeSnapshotMock = value as ActivatedRouteSnapshotMock;
        routeSnapshotMock.pathFromRoot = (array as ActivatedRouteSnapshotMock[]).slice(0, index + 1);

        return routeSnapshotMock;
      })[path.length - 1];

  const createService = createServiceFactory({
    service: BreadcrumbsService,
    providers: [mockProvider(NavigationService)]
  });

  test('should map current navigation route to breadcrumbs when instantiated', () => {
    const spectator = createService({
      providers: [
        mockProvider(NavigationService, {
          getCurrentActivatedRoute: () => ({
            snapshot: buildMockRoute([
              { urlSegments: [] },
              {
                urlSegments: ['first'],
                breadcrumb: {
                  icon: IconType.Application,
                  label: 'First Breadcrumb'
                }
              },
              {
                urlSegments: ['second'],
                breadcrumb: of({
                  icon: 'secondIcon',
                  label: 'Second Breadcrumb'
                })
              }
            ])
          }),
          navigation$: NEVER
        })
      ]
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.breadcrumbs$).toBe('x', {
        x: [
          {
            icon: IconType.Application,
            label: 'First Breadcrumb',
            url: ['first']
          },
          {
            icon: 'secondIcon',
            label: 'Second Breadcrumb',
            url: ['first', 'second']
          }
        ]
      });
    });
  });

  test('navigates to error page on a breadcrumb resolution error', () => {
    const spectator = createService({
      providers: [
        mockProvider(NavigationService, {
          getCurrentActivatedRoute: () => ({
            snapshot: buildMockRoute([
              {
                urlSegments: ['previous'],
                breadcrumb: {
                  label: 'Previous Breadcrumb'
                }
              }
            ])
          }),
          navigation$: of({
            snapshot: buildMockRoute([
              { urlSegments: [] },
              {
                urlSegments: ['first'],
                breadcrumb: {
                  icon: IconType.Application,
                  label: 'First Breadcrumb'
                }
              },
              {
                urlSegments: ['second'],
                breadcrumb: throwError('error in second breadcrumb')
              }
            ])
          })
        })
      ]
    });

    spectator.service.breadcrumbs$.subscribe();
    expect(spectator.inject(NavigationService).navigateToErrorPage).toHaveBeenCalled();
  });

  test('Returns the last string in the breadcrumb path when getLastBreadCrumbString is called', () => {
    const spectator = createService({
      providers: [
        mockProvider(NavigationService, {
          getCurrentActivatedRoute: () => ({
            snapshot: buildMockRoute([
              {
                urlSegments: ['services'],
                breadcrumb: {
                  label: 'services'
                }
              },
              {
                urlSegments: ['service'],
                breadcrumb: {
                  icon: ObservabilityIconType.Service,
                  label: 'service'
                }
              },
              {
                urlSegments: ['1234-1234-1234'],
                breadcrumb: {
                  label: 'Service name'
                }
              }
            ])
          }),
          navigation$: NEVER
        })
      ]
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.getLastBreadCrumbString()).toBe('x', {
        x: 'Service name'
      });
    });
  });
});

interface ActivatedRouteSnapshotBuildData {
  urlSegments: string[];
  breadcrumb?: Breadcrumb | Observable<Breadcrumb>;
}

interface ActivatedRouteSnapshotMock {
  pathFromRoot: ActivatedRouteSnapshotMock[];
  data: HtRouteData;
  url: { path: string }[];
}
