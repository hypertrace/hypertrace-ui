import { DataSource } from '@angular/cdk/collections';
import { Dictionary, forkJoinSafeEmpty, isEqualIgnoreFunctions, RequireBy, sortUnknown } from '@hypertrace/common';
import { isEqual, isNil } from 'lodash-es';
import { BehaviorSubject, combineLatest, NEVER, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { catchError, debounceTime, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';
import { PageEvent } from '../../paginator/page.event';
import { PaginationProvider } from '../../paginator/paginator-api';
import { RowStateChange, StatefulTableRow, StatefulTreeTableRow, TableFilter, TableRow } from '../table-api';
import { TableColumnConfigExtended } from '../table.service';
import { TableCdkColumnUtil } from './table-cdk-column-util';
import {
  ColumnConfigProvider,
  ColumnStateChangeProvider,
  FiltersProvider,
  RowStateChangeProvider,
  TableDataSourceProvider,
} from './table-cdk-data-source-api';
import { TableCdkRowUtil } from './table-cdk-row-util';
import { TableDataRequest } from './table-data-source';

type WatchedObservables = [
  TableColumnConfigExtended[],
  PageEvent,
  TableFilter[],
  Dictionary<unknown>,
  TableColumnConfigExtended | undefined,
  StatefulTableRow | undefined,
];

export class TableCdkDataSource implements DataSource<TableRow> {
  private static readonly DEFAULT_PAGE_SIZE: number = 1000;

  private readonly columnConfigs: Map<string, TableColumnConfigExtended> = new Map<string, TableColumnConfigExtended>();
  private cachedData: CachedData = { rows: [], total: 0 };
  private readonly cachedValues: Map<string, unknown[]> = new Map<string, unknown[]>();
  private lastRowChange: StatefulTableRow | undefined;
  private readonly rowsChange$: Subject<StatefulTableRow[]> = new Subject<StatefulTableRow[]>();
  private readonly loadingStateSubject: Subject<TableLoadingState> = new BehaviorSubject<TableLoadingState>({
    loading$: NEVER,
  });
  private changeSubscription?: Subscription;

  public loadingStateChange$: Observable<TableLoadingState> = this.loadingStateSubject.asObservable();

  public constructor(
    private readonly tableDataSourceProvider: TableDataSourceProvider,
    private readonly columnConfigProvider: ColumnConfigProvider,
    private readonly columnStateChangeProvider: ColumnStateChangeProvider,
    private readonly rowStateChangeProvider: RowStateChangeProvider,
    private readonly filtersProvider: FiltersProvider,
    private readonly paginationProvider?: PaginationProvider,
  ) {}

  /****************************
   * Connection
   ****************************/

  public connect(): Observable<ReadonlyArray<TableRow>> {
    this.changeSubscription = this.buildChangeObservable()
      .pipe(
        tap(() => this.loadingStateSubject.next({ loading$: NEVER })),
        /**
         * Below debounce is needed to handle multiple emission from buildChangeObservable.
         */
        debounceTime(100),
        mergeMap(([columnConfigs, pageEvent, filters, queryProperties, changedColumn, changedRow]) =>
          this.buildDataObservable(columnConfigs, pageEvent, filters, queryProperties, changedColumn, changedRow),
        ),
      )
      .subscribe(this.rowsChange$);

    return this.rowsChange$.pipe(
      tap(rows => this.cacheFilterableValues(rows)),
      tap(rows => this.loadingStateSubject.next({ loading$: of(rows), hide: rows.length > 0 })),
      catchError(error => {
        this.loadingStateSubject.next({ loading$: throwError(error) });

        return of([]);
      }),
    );
  }

  public disconnect(): void {
    this.changeSubscription?.unsubscribe();
    this.rowsChange$.complete();
    this.loadingStateSubject.complete();
  }

  public getFilterValues(field: string): unknown[] {
    return this.cachedValues.has(field) ? this.cachedValues.get(field)! : [];
  }

  private cacheNewData(total: number, rows: StatefulTableRow[], request?: TableDataRequest): void {
    this.cachedData = {
      request: request,
      rows: rows.map(TableCdkRowUtil.cloneRow),
      total: total,
    };
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
    if (TableCdkRowUtil.isFullyExpandable(this.cachedData.rows)) {
      const rows = TableCdkRowUtil.expandAllRows(this.cachedData.rows);
      this.rowsChange$.next(rows);
    }
  }

  public collapseAllRows(): void {
    const rows = TableCdkRowUtil.collapseAllRows(this.cachedData.rows);
    this.rowsChange$.next(rows);
  }

  public unselectAllRows(rows: StatefulTableRow[] = this.cachedData.rows): void {
    const selectedRows = TableCdkRowUtil.unselectAllRows(rows);
    this.lastRowChange = undefined;
    this.rowsChange$.next(TableCdkRowUtil.mergeRowStates(this.cachedData.rows, selectedRows));
  }

  public selectAllRows(rows: StatefulTableRow[] = this.cachedData.rows): void {
    const unselectedRows = TableCdkRowUtil.selectAllRows(rows);
    this.lastRowChange = undefined;
    this.rowsChange$.next(TableCdkRowUtil.mergeRowStates(this.cachedData.rows, unselectedRows));
  }

  public getAllRows(): StatefulTableRow[] {
    return this.cachedData.rows;
  }

  /****************************
   * Change Detection
   ****************************/

  private buildChangeObservable(): Observable<WatchedObservables> {
    return combineLatest([
      this.columnConfigChange(),
      this.pageChange(),
      this.filtersProvider.filters$,
      this.filtersProvider.queryProperties$,
      this.columnStateChangeProvider.columnState$,
      this.rowStateChangeProvider.rowState$,
    ]).pipe(map(values => this.detectRowStateChanges(...values)));
  }

  private columnConfigChange(): Observable<TableColumnConfigExtended[]> {
    return this.columnConfigProvider.columnConfigs$.pipe(
      tap(columnConfigs => {
        this.columnConfigs.clear();
        columnConfigs.forEach(columnConfig => this.columnConfigs.set(columnConfig.id, columnConfig));
      }),
    );
  }

  private pageChange(): Observable<PageEvent> {
    return this.paginationProvider
      ? this.paginationProvider.pageEvent$.pipe(
          startWith({
            pageSize: this.paginationProvider.pageSize,
            pageIndex: this.paginationProvider.pageIndex,
          }),
        )
      : of({ pageSize: TableCdkDataSource.DEFAULT_PAGE_SIZE, pageIndex: 0 });
  }

  private detectRowStateChanges(
    columnConfigs: TableColumnConfigExtended[],
    pageEvent: PageEvent,
    filters: TableFilter[],
    queryProperties: Dictionary<unknown>,
    changedColumn: TableColumnConfigExtended | undefined,
    changedRow: StatefulTableRow | undefined,
  ): WatchedObservables {
    return [columnConfigs, pageEvent, filters, queryProperties, changedColumn, this.buildRowStateChange(changedRow)];
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
    filters: TableFilter[],
    queryProperties: Dictionary<unknown>,
    changedColumn: TableColumnConfigExtended | undefined,
    changedRow: StatefulTableRow | undefined,
  ): Observable<StatefulTableRow[]> {
    if (changedRow !== undefined) {
      return of(this.cachedData.rows).pipe(
        map(cachedRows => TableCdkRowUtil.buildRowStateChanges(cachedRows, changedRow)),
        switchMap(stateChanges => this.fetchAndAppendNewChildren(stateChanges)),
        map(TableCdkRowUtil.removeCollapsedRows),
        tap(rows => this.cacheNewData(0, rows)),
      );
    }

    if (TableCdkColumnUtil.isColumnStateChange(changedColumn)) {
      TableCdkColumnUtil.unsortOtherColumns(changedColumn, columnConfigs);
    }

    return this.fetchData(columnConfigs, pageEvent, filters, queryProperties);
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
      }),
    ).pipe(map(TableCdkRowUtil.flattenNestedRows));
  }

  private fetchAndAppendChildren(parent: StatefulTreeTableRow): Observable<StatefulTableRow[]> {
    return parent.getChildren().pipe(
      map(childRows => TableCdkRowUtil.buildInitialChildRowStates(childRows, parent)),
      map(children => [parent, ...children]),
    );
  }

  private fetchData(
    columnConfigs: TableColumnConfigExtended[],
    pageEvent: PageEvent,
    filters: TableFilter[],
    queryProperties: Dictionary<unknown>,
  ): Observable<StatefulTableRow[]> {
    if (this.tableDataSourceProvider.data === undefined) {
      return of([]);
    }

    const request = this.buildRequest(columnConfigs, pageEvent, filters, queryProperties);

    return this.hasCacheForRequest(request) ? this.fetchCachedData(request) : this.fetchNewData(request);
  }

  private haveColumConfigsChanged(request: TableDataRequest): boolean {
    if (isNil(this.cachedData.request)) {
      return true;
    }

    return !isEqual(request.columns, this.cachedData.request.columns);
  }

  private hasCacheForRequest(request: TableDataRequest): boolean {
    if (
      this.cachedData.rows.length !== 0 &&
      this.cachedData.rows.length === this.cachedData.total &&
      request.position.limit <= this.cachedData.rows.length &&
      !this.haveColumConfigsChanged(request)
    ) {
      // Check if we already have all available results cached
      return true;
    }

    if (this.cachedData.rows.length < request.position.limit || !isEqual(this.cachedData.request?.sort, request.sort)) {
      // Sanity check if we have enough cached data for what we request
      return false;
    }

    const offsetWithinCachedRows = this.calcOffsetWithinCachedRows(request);

    // Check if requested startOffset + limit is within the cached data
    return (
      offsetWithinCachedRows >= 0 &&
      offsetWithinCachedRows + request.position.limit <= this.cachedData.rows.length &&
      !this.haveColumConfigsChanged(request)
    );
  }

  private calcOffsetWithinCachedRows(request: TableDataRequest): number {
    const cachedOffset = this.cachedData.request?.position.startIndex ?? 0;
    const currentOffset = request.position.startIndex;

    return currentOffset - cachedOffset;
  }

  private fetchNewData(request: TableDataRequest): Observable<StatefulTableRow[]> {
    if (this.tableDataSourceProvider.data === undefined) {
      return of([]);
    }

    let total = 0;

    return this.tableDataSourceProvider.data.getData(request).pipe(
      tap(response => (total = response.totalCount)),
      tap(response => this.updatePaginationTotalCount(response.totalCount)),
      map(response => response.data),
      map(TableCdkRowUtil.buildInitialRowStates),
      map(rows =>
        this.rowStateChangeProvider.initialExpandAll && TableCdkRowUtil.isFullyExpandable(rows)
          ? TableCdkRowUtil.expandAllRows(rows)
          : rows,
      ),
      tap(rows => this.cacheNewData(total, rows, request)),
      map(rows => rows.slice(0, request.position.limit)), // Paginate data
    );
  }

  private fetchCachedData(request: TableDataRequest): Observable<StatefulTableRow[]> {
    if (this.cachedData.rows.length < request.position.limit) {
      return of([]);
    }

    const offsetWithinCachedRows = this.calcOffsetWithinCachedRows(request);

    return of(this.cachedData.rows.slice(offsetWithinCachedRows, offsetWithinCachedRows + request.position.limit));
  }

  private buildRequest(
    columnConfigs: TableColumnConfigExtended[],
    pageEvent: PageEvent,
    filters: TableFilter[],
    queryProperties: Dictionary<unknown>,
  ): TableDataRequest {
    const request: TableDataRequest = {
      columns: TableCdkColumnUtil.fetchableColumnConfigs(columnConfigs),
      position: {
        startIndex: pageEvent.pageIndex * pageEvent.pageSize,
        limit: pageEvent.pageSize,
      },
      filters: filters,
    };

    columnConfigs
      .filter(
        (columnConfig): columnConfig is RequireBy<TableColumnConfigExtended, 'sort'> => columnConfig.sort !== undefined,
      )
      .forEach(columnConfig => {
        /*
         * NOTE: The columnConfigs are set up to allow multi-column sorting, but this is not currently supported.
         * In the row state modification we should be enforcing only one sorted column.
         */
        request.sort = {
          column: columnConfig,
          direction: columnConfig.sort,
        };
      });

    return { ...request, ...queryProperties };
  }

  private updatePaginationTotalCount(totalItems: number): void {
    if (this.paginationProvider) {
      this.paginationProvider.totalItems = totalItems;
    }
  }
}

export interface TableLoadingState {
  loading$: Observable<StatefulTableRow[]>;
  hide?: boolean;
}

export interface CachedData {
  request?: TableDataRequest;
  rows: StatefulTableRow[];
  total: number;
}
