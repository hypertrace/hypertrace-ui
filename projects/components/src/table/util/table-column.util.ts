import { TableColumnConfig } from '../table-api';

export abstract class TableColumnUtil {
  public static isSelectionStateColumn = (column?: TableColumnConfig): boolean => column?.id === '$$selected';

  public static isExpansionStateColumn = (column?: TableColumnConfig): boolean => column?.id === '$$expanded';

  public static isStateColumn = (column?: TableColumnConfig): boolean =>
    TableColumnUtil.isSelectionStateColumn(column) || TableColumnUtil.isExpansionStateColumn(column);
}
