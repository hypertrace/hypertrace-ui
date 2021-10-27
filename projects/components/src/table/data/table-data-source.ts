import { Observable } from 'rxjs';
import { TableColumnConfig, TableFilter, TableSortDirection } from '../table-api';

export interface TableDataSource<TResult, TCol extends TableColumnConfig = TableColumnConfig> {
  getData(request: TableDataRequest<TCol>): Observable<TableDataResponse<TResult>>;
  getScope?(): string | undefined;
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
  includeInactive?: boolean;
}

export interface TableDataResponse<TData> {
  data: TData[];
  totalCount: number;
}
