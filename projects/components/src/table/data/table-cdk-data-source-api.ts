import { Observable } from 'rxjs';
import { GraphQlFilter } from '../../../../distributed-tracing/src/shared/graphql/model/schema/filter/graphql-filter';
import { StatefulTableRow, TableMode, TableRow, TableSelectionMode } from '../table-api';
import { TableColumnConfigExtended } from '../table.service';
import { TableDataSource } from './table-data-source';

export interface TableDataSourceProvider {
  data?: TableDataSource<TableRow>;
}

export interface ColumnConfigProvider {
  columnConfigs$: Observable<TableColumnConfigExtended[]>;
}

export interface FiltersProvider {
  filters$: Observable<GraphQlFilter[]>;
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
