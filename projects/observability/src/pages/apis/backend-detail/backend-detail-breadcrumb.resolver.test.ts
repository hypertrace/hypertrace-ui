import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationService } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { patchRouterNavigateForTest, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import {
  BackendType,
  entityIdKey,
  entityTypeKey,
  ObservabilityEntityType
} from '../../../shared/graphql/model/schema/entity';
import { ENTITY_GQL_REQUEST } from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { ObservabilityIconType } from '../../../shared/icons/observability-icon-type';
import { EntityIconLookupService } from '../../../shared/services/entity/entity-icon-lookup.service';
import { BackendDetailBreadcrumbResolver } from './backend-detail-breadcrumb.resolver';

describe('Backend detail breadcrumb resolver', () => {
  let spectator: SpectatorService<BackendDetailBreadcrumbResolver>;
  let activatedRouteSnapshot: ActivatedRouteSnapshot;
  const buildResolver = createServiceFactory({
    service: BackendDetailBreadcrumbResolver,
    providers: [
      mockProvider(GraphQlRequestService, {
        queryDebounced: jest.fn().mockReturnValue(
          of({
            [entityTypeKey]: ObservabilityEntityType.Backend,
            [entityIdKey]: 'test-id',
            name: 'test backend',
            type: BackendType.Mysql
          })
        )
      }),
      mockProvider(EntityIconLookupService, {
        forBackendEntity: jest.fn().mockReturnValue(ObservabilityIconType.Mysql)
      })
    ],
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: 'backend/:id',
          children: []
        }
      ])
    ]
  });

  beforeEach(() => {
    spectator = buildResolver();
    patchRouterNavigateForTest(spectator);
    spectator.inject(Router).navigate(['backend', 'test-id']);
    activatedRouteSnapshot = spectator.inject(NavigationService).getCurrentActivatedRoute().snapshot;
  });

  test('returns the breadcrumb based on the backend', fakeAsync(() => {
    const resolverPromise = spectator.service.resolve(activatedRouteSnapshot);

    resolverPromise.then(breadcrumb$ => {
      runFakeRxjs(({ expectObservable }) => {
        expectObservable(breadcrumb$).toBe('(x|)', {
          x: {
            label: 'test backend',
            icon: ObservabilityIconType.Mysql
          }
        });
      });
    });

    flushMicrotasks();
    expect(spectator.inject(GraphQlRequestService).queryDebounced).toHaveBeenCalledWith(
      expect.objectContaining({
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Backend,
        id: 'test-id'
      })
    );
  }));
});
