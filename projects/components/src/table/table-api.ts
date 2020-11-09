import { Dictionary } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { FieldFilter } from '../filtering/filter/filter';
import { FilterOperator } from '../filtering/filter/filter-operators';
import { TableCellAlignmentType } from './cells/types/table-cell-alignment-type';

export interface TableColumnConfig {
  id: string; // This is the unique ID for the column (often same as 'name' except for composite fields)
  name?: string; // Attribute name (for composite columns use the attribute that should be filtered/sorted)
  display?: string;
  title?: string;
  titleTooltip?: string;
  sort?: TableSortDirection;
  visible?: boolean; // Is the column shown
  editable?: boolean; // Can the column be added/removed
  sortable?: boolean; // Can the column be sorted
  filterable?: boolean; // Can the column be filtered
  alignment?: TableCellAlignmentType;
  width?: number | string;
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
  value: unknown;
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
