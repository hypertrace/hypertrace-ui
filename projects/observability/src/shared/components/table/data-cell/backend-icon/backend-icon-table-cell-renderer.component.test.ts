import { NavigationService } from '@hypertrace/common';
import {
  TableColumnConfig,
  TableRow,
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_ROW_DATA
} from '@hypertrace/components';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { BackendType } from '../../../../graphql/model/schema/entity';
import { ObservabilityIconType } from '../../../../icons/observability-icon-type';
import { EntityIconLookupService } from '../../../../services/entity/entity-icon-lookup.service';
import { BackendIconTableCellRendererComponent } from './backend-icon-table-cell-renderer.component';

describe('Backend Icon table cell renderer component', () => {
  const tableCellRendererColumnProvider = (column: TableColumnConfig) => ({
    provide: TABLE_COLUMN_CONFIG,
    useValue: column
  });

  const tableCellRendererIndexProvider = (index: number) => ({
    provide: TABLE_COLUMN_INDEX,
    useValue: index
  });

  const tableCellDataRendererCellDataProvider = (cellData: unknown) => ({
    provide: TABLE_CELL_DATA,
    useValue: cellData
  });

  const tableRowDataRendererRowDataProvider = (rowData: TableRow) => ({
    provide: TABLE_ROW_DATA,
    useValue: rowData
  });

  const buildComponent = createComponentFactory({
    component: BackendIconTableCellRendererComponent,
    providers: [
      mockProvider(NavigationService),
      tableCellRendererColumnProvider({ id: 'test' }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(BackendType.Cassandra),
      tableRowDataRendererRowDataProvider({}),
      mockProvider(EntityIconLookupService, {
        forBackendType: jest.fn().mockReturnValue(ObservabilityIconType.Cassandra)
      })
    ],
    shallow: true
  });

  test('should render an icon', () => {
    const spectator = buildComponent();
    const element = spectator.query('.icon');

    expect(element).toExist();
    expect(spectator.component.value).toEqual(ObservabilityIconType.Cassandra);
  });

  test('should not add clickable class for clickable columns', () => {
    const spectator = buildComponent();

    const element = spectator.query('.clickable');

    expect(element).not.toHaveClass('clickable');
  });

  test('should add clickable class for columns without a click handler', () => {
    const spectator = buildComponent({
      providers: [
        tableCellRendererColumnProvider({
          id: 'test',
          onClick: () => {
            /* NOOP */
          }
        })
      ]
    });

    const element = spectator.query('.clickable');

    expect(element).toHaveClass('clickable');
  });
});
