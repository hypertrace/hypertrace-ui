import { CoreTableCellRendererType } from '../cells/types/core-table-cell-renderer-type';
import { TableColumnConfig } from '../table-api';

// tslint:disable-next-line:no-namespace
export namespace TableCdkColumnUtil {
  export const isColumnStateChange = (
    changedColumn: TableColumnConfig | undefined
  ): changedColumn is TableColumnConfig => changedColumn !== undefined;

  export const fetchableColumnConfigs = (columnConfigs: TableColumnConfig[]): TableColumnConfig[] =>
    columnConfigs.filter(
      columnConfig =>
        columnConfig.display !== CoreTableCellRendererType.RowExpander &&
        columnConfig.display !== CoreTableCellRendererType.Checkbox
    );

  export const unsortOtherColumns = (sortedColumn: TableColumnConfig, otherColumns: TableColumnConfig[]): void =>
    otherColumns
      .filter(column => column.id !== sortedColumn.id)
      .forEach(filteredColumn => (filteredColumn.sort = undefined));

  export const isColumnSortable = (columnConfig: TableColumnConfig): boolean =>
    columnConfig.sortable === undefined || columnConfig.sortable;
}
