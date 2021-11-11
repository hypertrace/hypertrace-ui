import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationService } from '@hypertrace/common';
import { GraphQlRequestCacheability, GraphQlRequestService } from '@hypertrace/graphql-client';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { EntityBreadcrumb } from './../../../shared/services/entity-breadcrumb/entity-breadcrumb.resolver';

import { patchRouterNavigateForTest, runFakeRxjs } from '@hypertrace/test-utils';
import { of } from 'rxjs';
import { EntityMetadata, ENTITY_METADATA } from '../../../shared/constants/entity-metadata';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { ENTITY_GQL_REQUEST } from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { ObservabilityIconType } from '../../../shared/icons/observability-icon-type';
import { ApiDetailBreadcrumbResolver } from './api-detail-breadcrumb.resolver';

describe('Api detail breadcrumb resolver', () => {
  let spectator: SpectatorService<ApiDetailBreadcrumbResolver<EntityBreadcrumb>>;
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
            [entityIdKey]: 'test-id',
            [entityTypeKey]: ObservabilityEntityType.Api,
            label: 'test service',
            icon: ObservabilityIconType.Service,
            url: ['services', 'service', 'test-service-id'],
            name: 'test api',
            parentId: 'test-service-id',
            parentName: 'test service',
            serviceName: 'test service',
            serviceId: 'test-service-id'
          },
          b: {
            [entityIdKey]: 'test-id',
            [entityTypeKey]: ObservabilityEntityType.Api,
            label: 'Endpoints',
            icon: ObservabilityIconType.Api,
            url: ['services', 'service', 'test-service-id', 'endpoints'],
            name: 'test api',
            parentId: 'test-service-id',
            parentName: 'test service',
            serviceName: 'test service',
            serviceId: 'test-service-id'
          },
          c: {
            [entityIdKey]: 'test-id',
            [entityTypeKey]: ObservabilityEntityType.Api,
            label: 'test api',
            icon: ObservabilityIconType.Api,
            url: ['api', 'test-id'],
            name: 'test api',
            parentId: 'test-service-id',
            parentName: 'test service',
            serviceName: 'test service',
            serviceId: 'test-service-id'
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
      { cacheability: GraphQlRequestCacheability.Cacheable }
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
            [entityIdKey]: 'test-id',
            [entityTypeKey]: ObservabilityEntityType.Api,
            label: 'test api',
            icon: ObservabilityIconType.Api,
            url: ['api', 'test-id'],
            name: 'test api',
            serviceName: 'test service',
            serviceId: 'test-service-id'
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
      { cacheability: GraphQlRequestCacheability.Cacheable }
    );
  }));
});
