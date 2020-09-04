import { NavigationService } from '@hypertrace/common';
import { tableCellIndexProvider, tableCellProviders } from '@hypertrace/components';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../../services/navigation/entity/entity-navigation.service';
import { EntityRendererComponent } from '../../../entity-renderer/entity-renderer.component';
import { EntityTableCellParser } from './entity-table-cell-parser';
import { EntityTableCellRendererComponent } from './entity-table-cell-renderer.component';

describe('Entity table cell renderer component', () => {
  const entity: Entity = {
    [entityIdKey]: 'test-id',
    [entityTypeKey]: ObservabilityEntityType.Service,
    name: 'test service'
  };

  const buildComponent = createComponentFactory({
    component: EntityTableCellRendererComponent,
    declarations: [MockComponent(EntityRendererComponent)],
    providers: [
      mockProvider(EntityNavigationService),
      mockProvider(NavigationService),
      ...tableCellProviders(
        {
          id: 'test'
        },
        new EntityTableCellParser(undefined!),
        0,
        entity
      )
    ],
    shallow: true
  });

  test('should render a milliseconds only value', () => {
    const spectator = buildComponent();
    expect(spectator.component.value).toEqual(entity);
  });

  test('should render first column with additional css class', () => {
    const spectator = buildComponent({
      providers: [tableCellIndexProvider(0)]
    });

    expect(spectator.query('.first-column')).toExist();
  });

  test('should render not first columns without an icon and no additional css class', () => {
    const spectator = buildComponent({
      providers: [tableCellIndexProvider(1)]
    });

    expect(spectator.query('ht-icon')).not.toExist();
    expect(spectator.query('.first-column')).not.toExist();
  });
});
