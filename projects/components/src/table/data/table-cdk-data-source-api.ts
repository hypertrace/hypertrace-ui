import { Dictionary } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { StatefulTableRow, TableFilter, TableMode, TableRow, TableSelectionMode } from '../table-api';
import { TableColumnConfigExtended } from '../table.service';
import { TableDataSource } from './table-data-source';

export interface TableDataSourceProvider {
  data?: TableDataSource<TableRow>;
}

export interface ColumnConfigProvider {
  columnConfigs$: Observable<TableColumnConfigExtended[]>;
}

export interface FiltersProvider {
  filters$: Observable<TableFilter[]>;
  queryProperties$: Observable<Dictionary<unknown>>;
}

export interface ColumnStateChangeProvider {
  columnState$: Observable<TableColumnConfigExtended | undefined>;
}

export interface RowStateChangeProvider {
  rowState$: Observable<StatefulTableRow | undefined>;
  mode?: TableMode;
  selectionMode?: TableSelectionMode;
  initialExpandAll?: boolean;
}
