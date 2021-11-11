import { EntityBreadcrumb } from './../../../shared/services/entity-breadcrumb/entity-breadcrumb.resolver';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationService } from '@hypertrace/common';
import { GraphQlRequestCacheability, GraphQlRequestService } from '@hypertrace/graphql-client';
import { patchRouterNavigateForTest, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { ENTITY_GQL_REQUEST } from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { ObservabilityIconType } from '../../../shared/icons/observability-icon-type';
import { EntityIconLookupService } from '../../../shared/services/entity/entity-icon-lookup.service';
import { ServiceDetailBreadcrumbResolver } from './service-detail-breadcrumb.resolver';

describe('Service detail breadcrumb resolver', () => {
  let spectator: SpectatorService<ServiceDetailBreadcrumbResolver<EntityBreadcrumb>>;
  let activatedRouteSnapshot: ActivatedRouteSnapshot;
  const buildResolver = createServiceFactory({
    service: ServiceDetailBreadcrumbResolver,
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(
          of({
            [entityTypeKey]: ObservabilityEntityType.Service,
            [entityIdKey]: 'test-id',
            name: 'test service'
          })
        )
      }),
      mockProvider(EntityIconLookupService, {
        forEntity: jest.fn().mockReturnValue(ObservabilityIconType.Service)
      })
    ],
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: 'service/:id',
          children: []
        }
      ])
    ]
  });

  beforeEach(() => {
    spectator = buildResolver();
    patchRouterNavigateForTest(spectator);
    spectator.inject(Router).navigate(['service', 'test-id']);
    activatedRouteSnapshot = spectator.inject(NavigationService).getCurrentActivatedRoute().snapshot;
  });

  test('returns the breadcrumb based on the service', fakeAsync(() => {
    const resolverPromise = spectator.service.resolve(activatedRouteSnapshot);

    resolverPromise.then(breadcrumb$ => {
      runFakeRxjs(({ expectObservable }) => {
        expectObservable(breadcrumb$).toBe('(x|)', {
          x: {
            label: 'test service',
            icon: ObservabilityIconType.Service
          }
        });
      });
    });

    flushMicrotasks();
    expect(spectator.inject(GraphQlRequestService).query).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Service,
        id: 'test-id'
      }),
      { cacheability: GraphQlRequestCacheability.NotCacheable }
    );
  }));
});
