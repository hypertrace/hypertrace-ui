import { Observable } from 'rxjs';
import { StatefulTableRow, TableMode, TableRow, TableSelectionMode } from '../table-api';
import { TableColumnConfigExtended } from '../table.service';
import { TableDataSource } from './table-data-source';

export interface TableDataSourceProvider {
  data?: TableDataSource<TableRow>;
  mode?: TableMode;
}

export interface ColumnConfigProvider {
  columnConfigs$: Observable<TableColumnConfigExtended[]>;
}

export interface FilterProvider {
  filter$: Observable<string>;
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
