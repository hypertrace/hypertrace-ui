import { Observable } from 'rxjs';
import { TableColumnConfig, TableFilter, TableSortDirection } from '../table-api';

export interface TableDataSource<TResult, TCol extends TableColumnConfig = TableColumnConfig> {
  getData(request: TableDataRequest<TCol>): Observable<TableDataResponse<TResult>>;
  getScope?(): string | undefined;
}

export interface TableDataRequest<TCol extends TableColumnConfig = TableColumnConfig> {
  columns: TCol[];
  position: TablePagePosition;
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

export interface TablePagePosition {
  startIndex: number;
  limit: number;
}
