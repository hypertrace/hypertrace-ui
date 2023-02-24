import { createModelFactory } from '@hypertrace/dashboards/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../../services/navigation/entity/entity-navigation.service';
import { EntityNavigationHandlerModel } from './entity-navigation-handler.model';

describe('Entity Navigation Handler Model', () => {
  const entity: Entity = {
    [entityIdKey]: 'test-id',
    [entityTypeKey]: ObservabilityEntityType.Api
  };

  const buildModel = createModelFactory({
    providers: [
      mockProvider(EntityNavigationService, {
        navigateToEntity: jest.fn()
      })
    ]
  });

  test('calls navigateToEntity with correct parameters', () => {
    const spectator = buildModel(EntityNavigationHandlerModel);
    const navService = spectator.get(EntityNavigationService);

    spectator.model.execute(entity);
    expect(navService.navigateToEntity).toHaveBeenLastCalledWith(entity);
  });
});
