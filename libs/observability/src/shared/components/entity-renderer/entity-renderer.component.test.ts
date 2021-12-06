import { IconType } from '@hypertrace/assets-library';
import { FormattingModule, NavigationParamsType, NavigationService } from '@hypertrace/common';
import { IconComponent, LinkComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../graphql/model/schema/entity';
import { ObservabilityIconType } from '../../icons/observability-icon-type';
import { EntityIconLookupService } from '../../services/entity/entity-icon-lookup.service';
import { EntityNavigationService } from '../../services/navigation/entity/entity-navigation.service';
import { EntityRendererComponent } from './entity-renderer.component';

describe('Entity Renderer Component', () => {
  let spectator: SpectatorHost<EntityRendererComponent>;

  const createHost = createHostFactory({
    component: EntityRendererComponent,
    imports: [FormattingModule],
    providers: [
      mockProvider(EntityNavigationService, {
        buildEntityDetailNavigationParams: jest.fn().mockReturnValue({
          navType: NavigationParamsType.InApp,
          path: ['/endpoint', 'test-id']
        })
      }),
      mockProvider(NavigationService),
      mockProvider(EntityIconLookupService, {
        forEntity: jest.fn().mockReturnValue(ObservabilityIconType.Api)
      })
    ],
    shallow: true,
    declarations: [MockComponent(IconComponent), MockComponent(LinkComponent)]
  });

  test('renders a basic entity without navigation', () => {
    const entity = {
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      name: 'test api'
    };

    spectator = createHost(
      `<ht-entity-renderer [entity]="entity" [navigable]="navigable" [showIcon]="showIcon">
      </ht-entity-renderer>`,
      {
        hostProps: {
          entity: entity,
          navigable: false,
          showIcon: true
        }
      }
    );

    const entityNavService = spectator.inject(EntityNavigationService);
    const rendererElement = spectator.query('.ht-entity-renderer')!;

    expect(rendererElement).toExist();

    expect(spectator.query('.name')).toHaveText('test api');
    expect(spectator.query(IconComponent)!.icon).toBe(ObservabilityIconType.Api);

    expect(entityNavService.buildEntityDetailNavigationParams).not.toHaveBeenCalled();
  });

  test('renders a basic entity with navigation', () => {
    const entity = {
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      name: 'test api'
    };

    spectator = createHost(
      `<ht-entity-renderer [entity]="entity" [navigable]="navigable" [showIcon]="showIcon">
      </ht-entity-renderer>`,
      {
        hostProps: {
          entity: entity,
          navigable: true,
          showIcon: true
        }
      }
    );

    expect(spectator.query('.name')).toHaveText('test api');
    expect(spectator.query(IconComponent)!.icon).toBe(ObservabilityIconType.Api);

    expect(spectator.inject(EntityNavigationService).buildEntityDetailNavigationParams).toHaveBeenCalledWith(
      entity,
      false
    );

    expect(spectator.query(LinkComponent)?.paramsOrUrl).toEqual({
      navType: NavigationParamsType.InApp,
      path: ['/endpoint', 'test-id']
    });
  });

  test('renders an entity without icon by default', () => {
    const entity = {
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      name: 'test api'
    };

    spectator = createHost(
      `<ht-entity-renderer [entity]="entity">
      </ht-entity-renderer>`,
      {
        hostProps: {
          entity: entity
        }
      }
    );

    expect(spectator.query('.name')).toHaveText('test api');
    expect(spectator.query(IconComponent)).not.toExist();
  });

  test('renders an entity with user provided icon', () => {
    const entity = {
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      name: 'test api'
    };

    spectator = createHost(
      `<ht-entity-renderer [entity]="entity" [icon]="icon" [showIcon]="showIcon">
      </ht-entity-renderer>`,
      {
        hostProps: {
          entity: entity,
          icon: IconType.Add,
          showIcon: false
        }
      }
    );

    expect(spectator.query('.name')).toHaveText('test api');
    expect(spectator.query(IconComponent)).not.toExist();

    spectator.setHostInput({
      showIcon: true
    });
    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.Add);
  });

  test('should inherit text color when enabled', () => {
    const entity = {
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      name: 'test api'
    };

    spectator = createHost(
      `<ht-entity-renderer [entity]="entity" [inheritTextStyle]="inheritTextStyle">
      </ht-entity-renderer>`,
      {
        hostProps: {
          entity: entity,
          inheritTextStyle: false
        }
      }
    );

    expect(spectator.query('.default-text-style')).toExist();
    expect(spectator.query('.ht-entity-renderer')).toBe(spectator.query('.default-text-style'));

    spectator.setHostInput({
      inheritTextStyle: true
    });
    expect(spectator.query('.default-text-style')).not.toExist();

    expect(spectator.query('.ht-entity-renderer')).not.toBe(spectator.query('.default-text-style'));
  });
});
