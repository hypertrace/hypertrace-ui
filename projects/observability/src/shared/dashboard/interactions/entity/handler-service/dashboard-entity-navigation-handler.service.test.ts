import { DashboardEventManagerService } from '@hypertrace/hyperdash-angular';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../../services/navigation/entity/entity-navigation.service';
import { DashboardEntityNavigationHandlerService } from './dashboard-entity-navigation-handler.service';

describe('Dashboard Entity Navigation Handler Service', () => {
  const entity: Entity = {
    [entityIdKey]: 'test-id',
    [entityTypeKey]: ObservabilityEntityType.Api
  };
  const createService = createServiceFactory({
    service: DashboardEntityNavigationHandlerService,
    providers: [
      mockProvider(EntityNavigationService, {
        navigateToEntity: jest.fn()
      }),
      mockProvider(DashboardEventManagerService, {
        getObservableForEvent: () => of(entity)
      })
    ]
  });

  test('calls entity nav service on receiving event', () => {
    const spectator = createService();
    const entityNavService = spectator.inject(EntityNavigationService);
    spectator.service.onQueryEvent(entity);

    expect(entityNavService.navigateToEntity).toHaveBeenCalledWith(entity);
  });
});
