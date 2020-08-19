import { Dictionary, NavigationService } from '@hypertrace/common';
import {
  TableColumnConfig,
  TableRow,
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from '@hypertrace/components';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../../services/navigation/entity/entity-navigation.service';
import { EntityRendererComponent } from '../../../entity-renderer/entity-renderer.component';
import { EntityTableCellRendererComponent } from './entity-table-cell-renderer.component';

describe('Entity table cell renderer component', () => {
  const entity: Entity = {
    [entityIdKey]: 'test-id',
    [entityTypeKey]: ObservabilityEntityType.Service,
    name: 'test service'
  };

  const tableCellRendererColumnProvider = (column: TableColumnConfig) => ({
    provide: TABLE_CELL_RENDERER_COLUMN_CONFIG,
    useValue: column
  });

  const tableCellRendererIndexProvider = (index: number) => ({
    provide: TABLE_CELL_RENDERER_COLUMN_INDEX,
    useValue: index
  });

  const tableCellDataRendererCellDataProvider = (cellData: unknown) => ({
    provide: TABLE_CELL_RENDERER_CELL_DATA,
    useValue: cellData
  });

  const tableRowDataRendererRowDataProvider = (rowData: TableRow) => ({
    provide: TABLE_CELL_RENDERER_ROW_DATA,
    useValue: rowData
  });

  const buildComponent = createComponentFactory({
    component: EntityTableCellRendererComponent,
    declarations: [MockComponent(EntityRendererComponent)],
    providers: [
      mockProvider(EntityNavigationService),
      mockProvider(NavigationService),
      tableCellRendererColumnProvider({ field: 'test' }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(entity),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render a milliseconds only value', () => {
    const spectator = buildComponent();
    expect(spectator.component.value).toEqual(entity);
  });

  test('should render first column with additional css class', () => {
    const spectator = buildComponent({
      providers: [tableCellRendererIndexProvider(0)]
    });

    expect(spectator.query('.first-column')).toExist();
  });

  test('should render not first columns without an icon and no additional css class', () => {
    const spectator = buildComponent({
      providers: [tableCellRendererIndexProvider(1)]
    });

    expect(spectator.query('htc-icon')).not.toExist();
    expect(spectator.query('.first-column')).not.toExist();
  });
});
