import { RouterTestingModule } from '@angular/router/testing';
import { NavigationService } from '@hypertrace/common';
import { patchRouterNavigateForTest } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { EntityMetadata, ENTITY_METADATA } from '../../../constants/entity-metadata';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../graphql/model/schema/entity';
import { ObservabilityIconType } from '../../../icons/observability-icon-type';
import { EntityNavigationService } from './entity-navigation.service';

describe('Entity Navigation Service', () => {
  let spectator: SpectatorService<EntityNavigationService>;
  let navigationService: NavigationService;

  const buildService = createServiceFactory({
    service: EntityNavigationService,
    providers: [
      mockProvider(NavigationService, {
        navigateWithinApp: jest.fn(),
        isRelativePathActive: () => true
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
              listPath: ['services']
            }
          ],
          [
            ObservabilityEntityType.Backend,
            {
              entityType: ObservabilityEntityType.Backend,
              icon: ObservabilityIconType.Backend,
              detailPath: (id: string) => ['backends', 'backend', id],
              listPath: ['backends']
            }
          ]
        ])
      }
    ],
    imports: [RouterTestingModule]
  });

  beforeEach(() => {
    spectator = buildService();
    navigationService = spectator.inject(NavigationService);
    patchRouterNavigateForTest(spectator);
  });

  test('can navigate correctly to service', () => {
    spectator.service.navigateToEntity({
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Service
    });

    expect(navigationService.navigateWithinApp).toHaveBeenCalledWith(['services', 'service', 'test-id']);
  });

  test('can navigate correctly to api', () => {
    spectator.service.navigateToEntity({
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api
    });

    expect(navigationService.navigateWithinApp).toHaveBeenCalledWith(['services', 'endpoint', 'test-id']);
  });

  test('can navigate correctly to backend', () => {
    spectator.service.navigateToEntity({
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Backend
    });

    expect(navigationService.navigateWithinApp).toHaveBeenCalledWith(['backends', 'backend', 'test-id']);
  });
});
