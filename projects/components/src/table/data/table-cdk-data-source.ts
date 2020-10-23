import { DataSource } from '@angular/cdk/collections';
import { forkJoinSafeEmpty, isEqualIgnoreFunctions, RequireBy, sortUnknown } from '@hypertrace/common';
import { combineLatest, NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';
import { PageEvent } from '../../paginator/page.event';
import { PaginationProvider } from '../../paginator/paginator-api';
import { RowStateChange, StatefulTableRow, StatefulTreeTableRow, TableRow } from '../table-api';
import { TableColumnConfigExtended } from '../table.service';
import { TableCdkColumnUtil } from './table-cdk-column-util';
import {
  ColumnConfigProvider,
  ColumnStateChangeProvider,
  FilterProvider,
  RowStateChangeProvider,
  TableDataSourceProvider
} from './table-cdk-data-source-api';
import { TableCdkRowUtil } from './table-cdk-row-util';
import { TableDataRequest } from './table-data-source';

type WatchedObservables = [
  TableColumnConfigExtended[],
  PageEvent,
  string,
  TableColumnConfigExtended | undefined,
  StatefulTableRow | undefined
];

export class TableCdkDataSource implements DataSource<TableRow> {
  private static readonly DEFAULT_PAGE_SIZE: number = 1000;
  private static readonly FILTER_DEBOUNCE_MS: number = 200;

  private readonly columnConfigs: Map<string, TableColumnConfigExtended> = new Map<string, TableColumnConfigExtended>();
  private cachedRows: StatefulTableRow[] = [];
  private readonly cachedValues: Map<string, unknown[]> = new Map<string, unknown[]>();
  private lastRowChange: StatefulTableRow | undefined;
  private readonly rowsChange$: Subject<StatefulTableRow[]> = new Subject<StatefulTableRow[]>();
  private readonly loadingStateSubject: Subject<Observable<StatefulTableRow[]>> = new Subject<
    Observable<StatefulTableRow[]>
  >();
  public loadingStateChange$: Observable<Observable<StatefulTableRow[]>> = this.loadingStateSubject.asObservable();

  public constructor(
    private readonly tableDataSourceProvider: TableDataSourceProvider,
    private readonly columnConfigProvider: ColumnConfigProvider,
    private readonly columnStateChangeProvider: ColumnStateChangeProvider,
    private readonly rowStateChangeProvider: RowStateChangeProvider,
    private readonly filterProvider?: FilterProvider,
    private readonly paginationProvider?: PaginationProvider
  ) {}

  /****************************
   * Connection
   ****************************/

  public connect(): Observable<ReadonlyArray<TableRow>> {
    this.buildChangeObservable()
      .pipe(
        tap(() => this.loadingStateSubject.next(NEVER)),
        mergeMap(([columnConfigs, pageEvent, filter, changedColumn, changedRow]) =>
          this.buildDataObservable(columnConfigs, pageEvent, filter, changedColumn, changedRow)
        )
      )
      .subscribe(this.rowsChange$);

    return this.rowsChange$.pipe(
      tap(rows => this.cacheRows(rows)),
      tap(rows => this.cacheFilterableValues(rows)),
      tap(rows => this.loadingStateSubject.next(of(rows)))
    );
  }

  public disconnect(): void {
    this.rowsChange$.complete();
    this.loadingStateSubject.complete();
  }

  public getFilterValues(field: string): unknown[] {
    return this.cachedValues.has(field) ? this.cachedValues.get(field)! : [];
  }

  private cacheRows(rows: StatefulTableRow[]): void {
    this.cachedRows = rows.map(TableCdkRowUtil.cloneRow);
  }

  private cacheFilterableValues(rows: StatefulTableRow[]): void {
    const valueMap: Map<string, Set<unknown>> = new Map<string, Set<unknown>>();

    // Iterate a row at a time adding each entry to the map. Use a set to store values so we have only unique.
    rows.forEach(row => {
      Object.entries(row).forEach((keyValueTuple: [string, unknown]) => {
        const key = keyValueTuple[0];
        const value = keyValueTuple[1];

        const columnConfig = this.columnConfigs.get(key);

        if (columnConfig === undefined) {
          return;
        }

        const filterValue = columnConfig.parser.parseFilterValue(value);

        if (valueMap.has(key)) {
          valueMap.get(key)?.add(filterValue);
        } else {
          valueMap.set(key, new Set([filterValue]));
        }
      });
    });

    // All unique values found, so now sort and transfer to cached storage.
    this.cachedValues.clear();
    valueMap.forEach((set, key) => {
      this.cachedValues.set(key, [...set.values()].sort(sortUnknown));
    });
  }

  /****************************
   * API
   ****************************/

  public expandAllRows(): void {
    if (TableCdkRowUtil.isFullyExpandable(this.cachedRows)) {
      const rows = TableCdkRowUtil.expandAllRows(this.cachedRows);
      this.rowsChange$.next(rows);
    }
  }

  public collapseAllRows(): void {
    const rows = TableCdkRowUtil.collapseAllRows(this.cachedRows);
    this.rowsChange$.next(rows);
  }

  public unselectAllRows(rows: StatefulTableRow[] = this.cachedRows): void {
    const selectedRows = TableCdkRowUtil.unselectAllRows(rows);
    this.lastRowChange = undefined;
    this.rowsChange$.next(TableCdkRowUtil.mergeRowStates(this.cachedRows, selectedRows));
  }

  public selectAllRows(rows: StatefulTableRow[] = this.cachedRows): void {
    const unselectedRows = TableCdkRowUtil.selectAllRows(rows);
    this.lastRowChange = undefined;
    this.rowsChange$.next(TableCdkRowUtil.mergeRowStates(this.cachedRows, unselectedRows));
  }

  /****************************
   * Change Detection
   ****************************/

  private buildChangeObservable(): Observable<WatchedObservables> {
    return combineLatest([
      this.columnConfigChange(),
      this.pageChange(),
      this.filterChange(),
      this.columnStateChangeProvider.columnState$,
      this.rowStateChangeProvider.rowState$
    ]).pipe(map(values => this.detectRowStateChanges(...values)));
  }

  private columnConfigChange(): Observable<TableColumnConfigExtended[]> {
    return this.columnConfigProvider.columnConfigs$.pipe(
      tap(columnConfigs => {
        this.columnConfigs.clear();
        columnConfigs.forEach(columnConfig => this.columnConfigs.set(columnConfig.id, columnConfig));
      })
    );
  }

  private pageChange(): Observable<PageEvent> {
    return this.paginationProvider
      ? this.paginationProvider.pageEvent$.pipe(
          startWith({ pageSize: this.paginationProvider.pageSize, pageIndex: this.paginationProvider.pageIndex })
        )
      : of({ pageSize: TableCdkDataSource.DEFAULT_PAGE_SIZE, pageIndex: 0 });
  }

  private filterChange(): Observable<string> {
    return this.filterProvider
      ? this.filterProvider.filter$.pipe(debounceTime(TableCdkDataSource.FILTER_DEBOUNCE_MS))
      : of('');
  }

  private detectRowStateChanges(
    columnConfigs: TableColumnConfigExtended[],
    pageEvent: PageEvent,
    filter: string,
    changedColumn: TableColumnConfigExtended | undefined,
    changedRow: StatefulTableRow | undefined
  ): WatchedObservables {
    return [columnConfigs, pageEvent, filter, changedColumn, this.buildRowStateChange(changedRow)];
  }

  private buildRowStateChange(changedRow: StatefulTableRow | undefined): StatefulTableRow | undefined {
    const isChange = !isEqualIgnoreFunctions(this.lastRowChange, changedRow);

    if (changedRow !== undefined) {
      /*
       * combineLatest will keep returning the same changedRow, so we never want to compare to the undefined
       */
      this.lastRowChange = TableCdkRowUtil.cloneRow(changedRow);
    }

    return isChange ? changedRow : undefined;
  }

  /****************************
   * Data
   ****************************/

  private buildDataObservable(
    columnConfigs: TableColumnConfigExtended[],
    pageEvent: PageEvent,
    filter: string,
    changedColumn: TableColumnConfigExtended | undefined,
    changedRow: StatefulTableRow | undefined
  ): Observable<StatefulTableRow[]> {
    if (changedRow !== undefined) {
      return of(this.cachedRows).pipe(
        map(cachedRows => TableCdkRowUtil.buildRowStateChanges(cachedRows, changedRow)),
        switchMap(stateChanges => this.fetchAndAppendNewChildren(stateChanges)),
        map(TableCdkRowUtil.removeCollapsedRows)
      );
    }

    if (TableCdkColumnUtil.isColumnStateChange(changedColumn)) {
      TableCdkColumnUtil.unsortOtherColumns(changedColumn, columnConfigs);
    }

    return this.fetchNewData(columnConfigs, pageEvent, filter);
  }

  private fetchAndAppendNewChildren(stateChanges: RowStateChange[]): Observable<StatefulTableRow[]> {
    return forkJoinSafeEmpty(
      stateChanges.map(stateChange => {
        // We also need to use the new state for cached entries that have changed
        const latest: StatefulTableRow = TableCdkRowUtil.latestRowChange(stateChange);

        // If we have a changed row that is newly expanded, then fetch the children
        if (TableCdkRowUtil.isNewlyExpandedParentRow(stateChange) && TableCdkRowUtil.isStatefulTreeTableRow(latest)) {
          return this.fetchAndAppendChildren(latest);
        }

        return of(latest);
      })
    ).pipe(map(TableCdkRowUtil.flattenNestedRows));
  }

  private fetchAndAppendChildren(parent: StatefulTreeTableRow): Observable<StatefulTableRow[]> {
    return parent.getChildren().pipe(
      map(childRows => TableCdkRowUtil.buildInitialChildRowStates(childRows, parent)),
      map(children => [parent, ...children])
    );
  }

  private fetchNewData(
    columnConfigs: TableColumnConfigExtended[],
    pageEvent: PageEvent,
    searchQuery: string
  ): Observable<StatefulTableRow[]> {
    if (this.tableDataSourceProvider.data === undefined) {
      return of([]);
    }

    return this.tableDataSourceProvider.data
      .getData(this.buildRequest(columnConfigs, pageEvent, searchQuery), this.tableDataSourceProvider.mode!)
      .pipe(
        tap(response => this.updatePaginationTotalCount(response.totalCount)),
        map(response => response.data),
        map(rows => this.paginateRows(rows, pageEvent)),
        map(TableCdkRowUtil.buildInitialRowStates),
        map(rows =>
          this.rowStateChangeProvider.initialExpandAll && TableCdkRowUtil.isFullyExpandable(rows)
            ? TableCdkRowUtil.expandAllRows(rows)
            : rows
        ),
        catchError(error => {
          this.loadingStateSubject.next(throwError(error));

          return [];
        })
      );
  }

  private buildRequest(
    columnConfigs: TableColumnConfigExtended[],
    pageConfig: PageEvent,
    filter: string
  ): TableDataRequest {
    const request: TableDataRequest = {
      columns: TableCdkColumnUtil.fetchableColumnConfigs(columnConfigs),
      position: {
        startIndex: pageConfig.pageIndex * pageConfig.pageSize,
        limit: pageConfig.pageSize
      },
      filter: filter
    };

    columnConfigs
      .filter(
        (columnConfig): columnConfig is RequireBy<TableColumnConfigExtended, 'sort'> => columnConfig.sort !== undefined
      )
      .forEach(columnConfig => {
        /*
         * NOTE: The columnConfigs are set up to allow multi-column sorting, but this is not currently supported.
         * In the row state modification we should be enforcing only one sorted column.
         */
        request.sort = {
          column: columnConfig,
          direction: columnConfig.sort
        };
      });

    return request;
  }

  /****************************
   * Pagination
   ****************************/

  private paginateRows(rows: TableRow[], pageConfig: PageEvent): TableRow[] {
    /*
     * The "rows" here are the results that are fetched. Since they are fetched with an offset in the request, we just
     * index off the start of the result rows.
     */
    const start = 0;
    const end = pageConfig.pageSize;

    return rows.slice(start, end);
  }

  private updatePaginationTotalCount(totalItems: number): void {
    if (this.paginationProvider) {
      this.paginationProvider.totalItems = totalItems;
    }
  }
}
