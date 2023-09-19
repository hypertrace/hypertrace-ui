import { Dictionary } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { FieldFilter, FilterValue } from '../filtering/filter/filter';
import { FilterOperator } from '../filtering/filter/filter-operators';
import { TableCellAlignmentType } from './cells/types/table-cell-alignment-type';

export interface TableColumnConfig<TableColumnOptions = unknown> {
  /**
   * This is the unique ID for the column (often same as 'name' except for composite fields)
   */
  id: string;
  /**
   * Attribute name (for composite columns use the attribute that should be filtered/sorted)
   */
  name?: string;
  /**
   * This is used to correlate with a cell renderer that should be used for the column
   */
  display?: string;
  /**
   * This is used to correlate with a csv generator that should be used for the column
   */
  csv?: string;
  title?: string;
  titleTooltip?: string;
  sort?: TableSortDirection;
  visible?: boolean;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  alignment?: TableCellAlignmentType;
  /**
   * Passing a `number` is considered as flex-grow
   * Width can also be passed as `px` or `%`
   */
  width?: TableColumnWidth;
  /**
   * Min Width can be passed as `px` or `%`
   */
  minWidth?: TableColumnFixedWidth;
  /**
   * Use the `options` to pass additional data to the renderer for
   * customizations.
   */
  options?: TableColumnOptions;

  onClick?(row: TableRow, column: TableColumnConfig): void;
}

export type TableRow = Dictionary<unknown>;

export interface TreeTableRow extends TableRow {
  getChildren(): Observable<TreeTableRow[]>;
}

export interface StatefulTableRow extends TableRow {
  $$state: TableRowState;
}

export interface StatefulTreeTableRow extends TreeTableRow {
  $$state: TableRowState;
}

export interface StatefulPrefetchedTreeTableRow extends TreeTableRow {
  $$state: PrefetchedTableRowState;
}

export interface TableRowState {
  parent?: StatefulTableRow;
  children?: StatefulPrefetchedTreeTableRow[];
  expanded: boolean;
  selected: boolean;
  root: boolean;
  leaf: boolean;
  depth: number;
}

export interface PrefetchedTableRowState extends TableRowState {
  parent?: StatefulPrefetchedTreeTableRow;
  children: StatefulPrefetchedTreeTableRow[];
}

export interface RowStateChange {
  cached: StatefulTableRow; // This is the previously cached row
  changed: StatefulTableRow | undefined; // This is populated if there is a change for this row or an ancestor
}

export interface TableFilter extends FieldFilter {
  operator: FilterOperator;
  value: FilterValue;
}

export const enum TableSortDirection {
  // These values are used in css
  Ascending = 'ASC',
  Descending = 'DESC'
}

export const enum TableMode {
  // These values are used in css
  Flat = 'flat',
  Detail = 'detail',
  Tree = 'tree'
}

export const enum TableStyle {
  // These values are used in css
  FullPage = 'full-page',
  Embedded = 'embedded',
  List = 'list'
}

export const enum TableSelectionMode {
  None = 'none',
  Single = 'single',
  Multiple = 'multiple'
}

export type TableColumnWidth = TableColumnFlexWidth | TableColumnFixedWidth;

export type TableColumnFlexWidth = number;

// Keeping `%` widths for minimal blast radius
export type TableColumnFixedWidth = `${number}%` | `${number}px`;
