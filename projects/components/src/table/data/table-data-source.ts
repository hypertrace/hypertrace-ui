import { Observable } from 'rxjs';
import { TableColumnConfig, TableFilter, TableMode, TableSortDirection } from '../table-api';

export interface TableDataSource<TResult, TCol extends TableColumnConfig = TableColumnConfig> {
  getData(request: TableDataRequest<TCol>, mode?: TableMode): Observable<TableDataResponse<TResult>>;
  getScope(mode?: TableMode): string | undefined;
}

export interface TableDataRequest<TCol extends TableColumnConfig = TableColumnConfig> {
  columns: TCol[];
  position: {
    startIndex: number;
    limit: number;
  };
  sort?: {
    column: TCol;
    direction: TableSortDirection;
  };
  filters?: TableFilter[];
}

export interface TableDataResponse<TData> {
  data: TData[];
  totalCount: number;
}
