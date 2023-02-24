import { CoreTableCellRendererType } from '../cells/types/core-table-cell-renderer-type';
import { TableColumnConfig, TableSortDirection } from '../table-api';
import { TableCdkColumnUtil } from './table-cdk-column-util';

describe('Table column util', () => {
  let dataColumnConfigs: TableColumnConfig[];
  let columnConfigs: TableColumnConfig[];

  beforeEach(() => {
    dataColumnConfigs = [
      {
        id: 'test-default',
        visible: true,
        sort: TableSortDirection.Ascending,
        sortable: true
      },
      {
        id: 'test-text',
        display: CoreTableCellRendererType.Text,
        sort: TableSortDirection.Descending,
        visible: true
      },
      {
        id: 'test-numeric',
        display: CoreTableCellRendererType.Number,
        visible: true,
        sortable: false
      }
    ];

    columnConfigs = [
      ...dataColumnConfigs,
      {
        id: 'test-expander',
        display: CoreTableCellRendererType.RowExpander
      }
    ];
  });

  test('should check if column is changed', () => {
    expect(TableCdkColumnUtil.isColumnStateChange(columnConfigs[0])).toEqual(true);
    expect(TableCdkColumnUtil.isColumnStateChange(undefined)).toEqual(false);
  });

  test('should remove row expander', () => {
    expect(TableCdkColumnUtil.fetchableColumnConfigs(columnConfigs)).toEqual(dataColumnConfigs);
  });

  test('should unsort other columns', () => {
    TableCdkColumnUtil.unsortOtherColumns(dataColumnConfigs[0], dataColumnConfigs);
    expect(dataColumnConfigs).toEqual([
      {
        id: 'test-default',
        visible: true,
        sort: TableSortDirection.Ascending,
        sortable: true
      },
      {
        id: 'test-text',
        display: CoreTableCellRendererType.Text,
        visible: true
      },
      {
        id: 'test-numeric',
        display: CoreTableCellRendererType.Number,
        visible: true,
        sortable: false
      }
    ]);
  });

  test('should check sortable for column config', () => {
    expect(TableCdkColumnUtil.isColumnSortable(dataColumnConfigs[0])).toBeTruthy();
    expect(TableCdkColumnUtil.isColumnSortable(dataColumnConfigs[1])).toBeTruthy();
    expect(TableCdkColumnUtil.isColumnSortable(dataColumnConfigs[2])).toBeFalsy();
  });
});
