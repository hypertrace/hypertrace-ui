import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationService } from '@hypertrace/common';
import { GraphQlRequestCacheability, GraphQlRequestService } from '@hypertrace/graphql-client';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';

import { patchRouterNavigateForTest, runFakeRxjs } from '@hypertrace/test-utils';
import { of } from 'rxjs';
import { EntityMetadata, ENTITY_METADATA } from '../../../shared/constants/entity-metadata';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { ENTITY_GQL_REQUEST } from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { ObservabilityIconType } from '../../../shared/icons/observability-icon-type';
import { ApiDetailBreadcrumbResolver } from './api-detail-breadcrumb.resolver';

describe('Api detail breadcrumb resolver', () => {
  let spectator: SpectatorService<ApiDetailBreadcrumbResolver>;
  let activatedRouteSnapshot: ActivatedRouteSnapshot;
  const buildResolver = createServiceFactory({
    service: ApiDetailBreadcrumbResolver,
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(
          of({
            [entityTypeKey]: ObservabilityEntityType.Api,
            [entityIdKey]: 'test-id',
            name: 'test api',
            serviceName: 'test service',
            serviceId: 'test-service-id'
          })
        )
      }),
      {
        provide: ENTITY_METADATA,
        useValue: new Map<string, EntityMetadata>([
          [
            ObservabilityEntityType.Api,
            {
              entityType: ObservabilityEntityType.Api,
              icon: ObservabilityIconType.Api,
              detailPath: (id: string, sourceRoute?: string) => [sourceRoute ?? '', 'endpoint', id],
              sourceRoutes: ['services']
            }
          ],
          [
            ObservabilityEntityType.Service,
            {
              entityType: ObservabilityEntityType.Service,
              icon: ObservabilityIconType.Service,
              detailPath: (id: string) => ['services', 'service', id],
              apisListPath: (id: string) => ['services', 'service', id, 'endpoints'],
              listPath: ['services'],
              typeDisplayName: 'Service'
            }
          ]
        ])
      }
    ],
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: 'api/:id',
          children: []
        }
      ])
    ]
  });

  beforeEach(() => {
    spectator = buildResolver();
    patchRouterNavigateForTest(spectator);
    spectator.inject(Router).navigate(['api', 'test-id']);
    activatedRouteSnapshot = spectator.inject(NavigationService).getCurrentActivatedRoute().snapshot;
  });

  test('returns the service and api breadcrumb', fakeAsync(() => {
    const navigationService = spectator.inject(NavigationService);
    spyOn(navigationService, 'isRelativePathActive').and.callFake(item => item[0] === 'services');

    const resolverPromise = spectator.service.resolve(activatedRouteSnapshot);

    resolverPromise.then(breadcrumb$ => {
      runFakeRxjs(({ expectObservable }) => {
        expectObservable(breadcrumb$).toBe('(abc|)', {
          a: {
            label: 'test service',
            icon: ObservabilityIconType.Service,
            url: ['services', 'service', 'test-service-id']
          },
          b: {
            label: 'Endpoints',
            icon: ObservabilityIconType.Api,
            url: ['services', 'service', 'test-service-id', 'endpoints']
          },
          c: {
            label: 'test api',
            icon: ObservabilityIconType.Api,
            url: ['api', 'test-id']
          }
        });
      });
    });

    flushMicrotasks();
    expect(spectator.inject(GraphQlRequestService).query).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id'
      }),
      { cacheability: GraphQlRequestCacheability.NotCacheable }
    );
  }));

  test('returns the api breadcrumb for no previous navigation', fakeAsync(() => {
    const navigationService = spectator.inject(NavigationService);
    spyOn(navigationService, 'isRelativePathActive').and.returnValue(false);

    const resolverPromise = spectator.service.resolve(activatedRouteSnapshot);

    resolverPromise.then(breadcrumb$ => {
      runFakeRxjs(({ expectObservable }) => {
        expectObservable(breadcrumb$).toBe('(y|)', {
          y: {
            label: 'test api',
            icon: ObservabilityIconType.Api,
            url: ['api', 'test-id']
          }
        });
      });
    });

    flushMicrotasks();
    expect(spectator.inject(GraphQlRequestService).query).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id'
      }),
      { cacheability: GraphQlRequestCacheability.NotCacheable }
    );
  }));
});
