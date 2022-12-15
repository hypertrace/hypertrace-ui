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
  sort?: SortSpecification<TCol>;
  filters?: TableFilter[];
  includeInactive?: boolean;

  /**
   * New property solely added for client side filtering specifications
   */
  clientSideFilters?: TableFilter[];
  /**
   * New property solely added for client side sorting specifications
   */
  clientSideSort?: SortSpecification<TCol>;
}

export interface TableDataResponse<TData> {
  data: TData[];
  totalCount: number;
}

export interface SortSpecification<T> {
  column: T;
  direction: TableSortDirection;
}

/**
 * We need this information in the data source layer as the query
 * needs to be reset to the original one to prevent refetch
 */
export interface ClientSideSort {
  direction: TableSortDirection;
  defaultSortColumnIndex: number;
}
