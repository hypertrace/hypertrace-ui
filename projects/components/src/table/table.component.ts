import { CdkHeaderRow } from '@angular/cdk/table';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { isEqualIgnoreFunctions, NavigationService, NumberCoercer, TypedSimpleChanges } from '@hypertrace/common';
import { without } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FilterAttribute } from '../filtering/filter-bar/filter-attribute';
import { PageEvent } from '../paginator/page.event';
import { PaginatorComponent } from '../paginator/paginator.component';
import { CoreTableCellRendererType } from './cells/types/core-table-cell-renderer-type';
import { TableCdkColumnUtil } from './data/table-cdk-column-util';
import { TableCdkDataSource } from './data/table-cdk-data-source';
import {
  ColumnConfigProvider,
  ColumnStateChangeProvider,
  FilterProvider,
  RowStateChangeProvider,
  TableDataSourceProvider
} from './data/table-cdk-data-source-api';
import { TableCdkRowUtil } from './data/table-cdk-row-util';
import { TableDataSource } from './data/table-data-source';
import {
  StatefulTableRow,
  TableColumnConfig,
  TableMode,
  TableRow,
  TableSelectionMode,
  TableSortDirection,
  TableStyle
} from './table-api';
import { TableColumnConfigExtended, TableService } from './table.service';

// tslint:disable max-file-line-count
@Component({
  selector: 'ht-table',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Search -->
    <div *ngIf="this.searchable" class="table-controls">
      <ht-search-box
        class="search-box"
        [placeholder]="this.searchPlaceholder"
        (valueChange)="this.applyFilter($event)"
      ></ht-search-box>
    </div>

    <!-- Table -->
    <cdk-table
      *ngIf="this.dataSource"
      [multiTemplateDataRows]="this.isDetailType()"
      [dataSource]="this.dataSource"
      [ngClass]="[this.display, this.pageable && this.isTableFullPage ? 'bottom-margin' : '']"
      class="table"
    >
      <!-- Columns -->
      <div *ngFor="let columnDef of this.columnConfigs$ | async; trackBy: this.trackItem; index as index">
        <ng-container [cdkColumnDef]="columnDef.id">
          <cdk-header-cell
            *cdkHeaderCellDef
            [style.flex-basis]="columnDef.width"
            [style.max-width]="columnDef.width"
            class="header-cell"
          >
            <div *ngIf="index !== 0" class="header-column-handle" (mousedown)="this.onResizeMouseDown($event, index)">
              <div class="header-column-divider"></div>
            </div>
            <ht-table-header-cell-renderer
              class="header-cell-renderer"
              [metadata]="this.metadata"
              [columnConfig]="columnDef"
              [index]="index"
              [sort]="columnDef.sort"
              (sortChange)="this.onHeaderCellClick(columnDef)"
            >
            </ht-table-header-cell-renderer>
          </cdk-header-cell>
          <cdk-cell
            *cdkCellDef="let row"
            [style.flex-basis]="columnDef.width"
            [style.max-width]="columnDef.width"
            [style.margin-left]="this.indent(columnDef, row)"
            [ngClass]="{
              'child-row': this.isChildRow(row),
              'expander-column': this.isExpanderColumn(columnDef),
              'detail-expanded': this.isDetailExpanded(row)
            }"
            class="data-cell"
          >
            <ht-table-data-cell-renderer
              class="data-cell-renderer"
              [metadata]="this.metadata"
              [columnConfig]="columnDef"
              [index]="this.columnIndex(columnDef, index)"
              [rowData]="row"
              [cellData]="row[columnDef.id]"
              (click)="this.onDataCellClick(row)"
            ></ht-table-data-cell-renderer>
          </cdk-cell>
        </ng-container>
      </div>

      <!-- Expandable Detail Column -->
      <ng-container [cdkColumnDef]="this.expandedDetailColumnConfig.id" *ngIf="this.isDetailType()">
        <cdk-cell *cdkCellDef="let row" [attr.colspan]="this.columnConfigsSubject.value.length" class="expanded-cell">
          <ht-table-expanded-detail-row-cell-renderer
            *ngIf="this.isRowExpanded(row)"
            [row]="row"
            [expanded]="this.isRowExpanded(row)"
            [content]="this.detailContent"
          ></ht-table-expanded-detail-row-cell-renderer>
        </cdk-cell>
      </ng-container>

      <!-- Header Row -->
      <ng-container *ngIf="this.isShowHeader()">
        <cdk-header-row *cdkHeaderRowDef="this.visibleColumns()" class="header-row"></cdk-header-row>
      </ng-container>

      <!-- Data Rows -->
      <cdk-row
        *cdkRowDef="let row; columns: this.visibleColumns()"
        (mouseenter)="this.onDataRowMouseEnter(row)"
        (mouseleave)="this.onDataRowMouseLeave()"
        [ngClass]="{ 'selected-row': this.shouldHighlightRowAsSelection(row), 'hovered-row': this.isHoveredRow(row) }"
        class="data-row"
      ></cdk-row>

      <!-- Expandable Detail Rows -->
      <ng-container *ngIf="this.isDetailType()">
        <cdk-row *cdkRowDef="let row; columns: [this.expandedDetailColumnConfig.id]" class="expandable-row"></cdk-row>
      </ng-container>
    </cdk-table>

    <!-- State Watcher -->
    <div class="state-watcher">
      <ng-container class="state-watcher" *htLoadAsync="this.dataSource?.loadingStateChange$ | async"></ng-container>
    </div>

    <!-- Pagination -->
    <div class="pagination-controls" *ngIf="this.pageable" [style.position]="this.isTableFullPage ? 'fixed' : 'sticky'">
      <ht-paginator
        *htLetAsync="this.urlPageData$ as pageData"
        (pageChange)="this.onPageChange($event)"
        [pageSizeOptions]="this.pageSizeOptions"
        [pageSize]="pageData?.pageSize"
        [pageIndex]="pageData?.pageIndex"
      ></ht-paginator>
    </div>
  `
})
export class TableComponent
  implements
    OnChanges,
    AfterViewInit,
    OnDestroy,
    ColumnConfigProvider,
    TableDataSourceProvider,
    FilterProvider,
    ColumnStateChangeProvider,
    RowStateChangeProvider {
  private static readonly PAGE_INDEX_URL_PARAM: string = 'page';
  private static readonly PAGE_SIZE_URL_PARAM: string = 'page-size';
  private static readonly SORT_COLUMN_URL_PARAM: string = 'sort-by';
  private static readonly SORT_DIRECTION_URL_PARAM: string = 'sort-direction';

  private readonly expandableToggleColumnConfig: TableColumnConfig = {
    id: '$$state',
    width: '32px',
    visible: true,
    display: CoreTableCellRendererType.RowExpander,
    onClick: (row: StatefulTableRow) => this.toggleRowExpanded(row)
  };

  private readonly multiSelectRowColumnConfig: TableColumnConfig = {
    id: '$$state',
    width: '32px',
    visible: true,
    display: CoreTableCellRendererType.Checkbox,
    onClick: (row: StatefulTableRow) => this.toggleRowSelected(row)
  };

  public readonly expandedDetailColumnConfig: TableColumnConfig = {
    id: '$$detail'
  };

  @Input()
  public columnConfigs?: TableColumnConfig[];

  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public data?: TableDataSource<TableRow>;

  @Input()
  public mode?: TableMode = TableMode.Flat;

  @Input()
  public display?: TableStyle = TableStyle.Embedded;

  @Input()
  public selectionMode?: TableSelectionMode = TableSelectionMode.Single;

  @Input()
  public title?: string;

  @Input()
  public searchable?: boolean = false;

  @Input()
  public pageable?: boolean = true;

  @Input()
  public detailContent?: TemplateRef<{ row: StatefulTableRow }>;

  @Input()
  public initialExpandAll?: boolean = false;

  @Input()
  public selections?: StatefulTableRow[] = [];

  @Input()
  public hovered?: StatefulTableRow;

  @Input()
  public syncWithUrl?: boolean = false;

  @Input()
  public pageSizeOptions: number[] = [25, 50, 100];

  @Input()
  public pageSize?: number;

  @Input()
  public searchPlaceholder: string = 'Search';

  @Output()
  public readonly selectionsChange: EventEmitter<StatefulTableRow[]> = new EventEmitter<StatefulTableRow[]>();

  @Output()
  public readonly hoveredChange: EventEmitter<StatefulTableRow | undefined> = new EventEmitter<
    StatefulTableRow | undefined
  >();

  @Output()
  public readonly toggleRowChange: EventEmitter<StatefulTableRow> = new EventEmitter<StatefulTableRow>();

  @Output()
  public readonly toggleAllChange: EventEmitter<boolean> = new EventEmitter<boolean>(); // True: expand, False: collapse

  @Output()
  public readonly pageChange: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @ViewChild(PaginatorComponent)
  public paginator?: PaginatorComponent;

  @ViewChild(CdkHeaderRow, { read: ElementRef })
  public headerRowElement!: ElementRef;

  public readonly columnConfigsSubject: BehaviorSubject<TableColumnConfigExtended[]> = new BehaviorSubject<
    TableColumnConfigExtended[]
  >([]);
  private readonly filterSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private readonly rowStateSubject: BehaviorSubject<StatefulTableRow | undefined> = new BehaviorSubject<
    StatefulTableRow | undefined
  >(undefined);
  private readonly columnStateSubject: BehaviorSubject<TableColumnConfigExtended | undefined> = new BehaviorSubject<
    TableColumnConfigExtended | undefined
  >(undefined);

  public readonly columnConfigs$: Observable<TableColumnConfigExtended[]> = this.columnConfigsSubject.asObservable();
  public readonly filter$: Observable<string> = this.filterSubject.asObservable();
  public readonly rowState$: Observable<StatefulTableRow | undefined> = this.rowStateSubject.asObservable();
  public readonly columnState$: Observable<
    TableColumnConfigExtended | undefined
  > = this.columnStateSubject.asObservable();
  public readonly urlPageData$: Observable<Partial<PageEvent> | undefined> = this.activatedRoute.queryParamMap.pipe(
    map(params => this.getPageData(params))
  );

  public dataSource?: TableCdkDataSource;
  public isTableFullPage: boolean = false;

  private resizeHeaderOffsetLeft: number = 0;
  private resizeStartX: number = 0;
  private resizeColumns?: ResizeColumns;

  public constructor(
    private readonly elementRef: ElementRef,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tableService: TableService
  ) {
    combineLatest([this.activatedRoute.queryParamMap, this.columnConfigs$])
      .pipe(
        map(([queryParamMap, columns]) => this.sortDataFromUrl(queryParamMap, columns)),
        filter((sort): sort is Required<SortedColumn> => sort !== undefined)
      )
      .subscribe(sort => this.updateSort(sort));
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.display) {
      this.isTableFullPage = this.display === TableStyle.FullPage;
    }

    if (changes.columnConfigs || changes.detailContent || changes.metadata) {
      this.initializeColumns();
    }

    if (changes.data || changes.pageSize || changes.pageSizeOptions || changes.pageable) {
      this.initializeData();
    }

    if (changes.selections) {
      this.initializeRows();
    }
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      !this.dataSource && this.initializeData();
      this.initializeColumns();
    });
  }

  public ngOnDestroy(): void {
    this.filterSubject.complete();
    this.rowStateSubject.complete();
    this.columnStateSubject.complete();
    this.columnConfigsSubject.complete();
  }

  public trackItem(_index: number, column: TableColumnConfigExtended): string {
    return `${column.id}-${column.width}`;
  }

  public queryHeaderCellElement(index: number): HTMLElement {
    return this.elementRef.nativeElement.querySelectorAll('cdk-header-cell').item(index);
  }

  private getVisibleColumnConfig(index: number): TableColumnConfigExtended {
    return this.columnConfigsSubject.value.filter(cc => cc.visible)[index];
  }

  public onResizeMouseDown(event: MouseEvent, index: number): void {
    this.resizeHeaderOffsetLeft = this.headerRowElement.nativeElement.offsetLeft;

    this.resizeColumns = {
      left: this.buildColumnInfo(index - 1),
      right: this.buildColumnInfo(index)
    };

    this.resizeStartX = event.clientX;
    event.preventDefault();
  }

  @HostListener('mousemove', ['$event'])
  public onResizeMouseMove(event: MouseEvent): void {
    if (this.resizeColumns === undefined) {
      return;
    }

    const offsetX = this.calcOffsetX(
      event,
      this.resizeStartX,
      this.resizeHeaderOffsetLeft + this.resizeColumns.left.bounds.left,
      this.resizeHeaderOffsetLeft + this.resizeColumns.right.bounds.right
    );

    this.resizeColumns.left.config.width = `${this.resizeColumns.left.element.offsetWidth + offsetX}px`;
    this.resizeColumns.right.config.width = `${this.resizeColumns.right.element.offsetWidth - offsetX}px`;

    this.resizeStartX = this.resizeStartX + offsetX;

    this.changeDetector.markForCheck();
  }

  @HostListener('mouseup')
  public onResizeMouseUp(): void {
    this.resizeColumns = undefined;
  }

  private buildColumnInfo(index: number): ColumnInfo {
    const element = this.queryHeaderCellElement(index);

    return {
      config: this.getVisibleColumnConfig(index),
      element: element,
      bounds: this.calcBounds(element)
    };
  }

  private calcBounds(element: HTMLElement): ColumnBounds {
    // We add additional padding so a portion of the column remains visible to resize (asymmetry due to resize-handle)
    return {
      left: element.offsetLeft + 12,
      right: element.offsetLeft + element.offsetWidth - 8
    };
  }

  private calcOffsetX(event: MouseEvent, startX: number, minX: number, maxX: number): number {
    const isResizeLeft = event.clientX - startX < 0;

    return isResizeLeft ? Math.max(minX, event.clientX) - startX : Math.min(maxX, event.clientX) - startX;
  }

  private initializeColumns(): void {
    this.columnConfigsSubject.next(this.buildColumnConfigExtendeds());
  }

  private initializeData(): void {
    if (!this.canBuildDataSource()) {
      this.dataSource = undefined;

      return;
    }

    this.dataSource = this.buildDataSource();
    this.dataSource?.loadingStateChange$.subscribe(() => {
      this.tableService.updateFilterValues(this.columnConfigsSubject.value, this.dataSource!); // Mutation! Ew!
    });

    this.initializeRows();
  }

  private initializeRows(): void {
    this.rowStateSubject.next(undefined);
    this.toggleRowSelections(this.selections);
  }

  private canBuildDataSource(): boolean {
    return !!this.data && !!this.columnConfigs && (this.pageable ? !!this.paginator : true);
  }

  public onHeaderCellClick(columnConfig: TableColumnConfigExtended): void {
    if (TableCdkColumnUtil.isColumnSortable(columnConfig)) {
      this.updateSort({
        column: columnConfig,
        direction: this.getNextSortDirection(columnConfig.sort)
      });
    }

    if (this.syncWithUrl) {
      this.navigationService.addQueryParametersToUrl({
        [TableComponent.SORT_COLUMN_URL_PARAM]: columnConfig.sort === undefined ? undefined : columnConfig.id,
        [TableComponent.SORT_DIRECTION_URL_PARAM]: columnConfig.sort
      });
    }
  }

  public onDataCellClick(row: StatefulTableRow): void {
    // NOTE: Cell Renderers generally handle their own clicks. We should only perform table actions here.

    /*
     * TODO: The reason we have this here is so that when the expander column is clicked it doesn't cause a
     *  row selection as well. The disadvantage is now the row selection only happens when clicking within the
     *  bounds of a cell, which is a smaller hit box due to row padding. Need to revisit.
     */
    // Propagate the cell click to the row
    this.onDataRowClick(row);
  }

  public onDataRowClick(row: StatefulTableRow): void {
    if (this.hasSelectableRows()) {
      this.toggleRowSelected(row);
    }
  }

  public onDataRowMouseEnter(row: StatefulTableRow): void {
    this.hovered = row;
    this.hoveredChange.emit(this.hovered);
  }

  public onDataRowMouseLeave(): void {
    this.hovered = undefined;
    this.hoveredChange.emit(this.hovered);
  }

  public indent(columnConfig: TableColumnConfig, row: StatefulTableRow): string {
    if (this.isExpanderColumn(columnConfig)) {
      return `${row.$$state.depth * 12}px`;
    }

    return '0';
  }

  public columnIndex(columnConfig: TableColumnConfig, index: number): number {
    if (this.isExpanderColumn(columnConfig)) {
      return 0;
    }

    return this.hasExpandableRows() ? index - 1 : index;
  }

  private buildColumnConfigExtendeds(): TableColumnConfigExtended[] {
    if (!this.columnConfigs || !this.dataSource) {
      return [];
    }

    let colConfigs = this.columnConfigs;

    if (this.hasExpandableRows()) {
      colConfigs = [this.expandableToggleColumnConfig, ...this.columnConfigs];
    } else if (this.hasMultiSelect()) {
      colConfigs = [this.multiSelectRowColumnConfig, ...this.columnConfigs];
    }

    return this.tableService.buildExtendedColumnConfigs(colConfigs, this.dataSource, this.metadata || []);
  }

  private buildDataSource(): TableCdkDataSource {
    if (!this.canBuildDataSource()) {
      throw new Error('Undefined data, columnConfigs, or paginator');
    }

    return new TableCdkDataSource(this, this, this, this, this, this.paginator);
  }

  public applyFilter(value: string): void {
    this.filterSubject.next(value);
  }

  public visibleColumns(): string[] {
    return this.columnConfigsSubject.value
      .filter(columnConfig => columnConfig.visible)
      .map(columnConfig => columnConfig.id);
  }

  private updateSort(sort: SortedColumn): void {
    sort.column.sort = sort.direction;
    this.columnStateSubject.next(sort.column);
  }

  private toggleRowSelections(selections: StatefulTableRow[] = []): void {
    // Unselect all the rows and only select the latest user provided ones
    this.dataSource?.unselectAllRows();
    this.dataSource?.selectAllRows(selections);
    this.changeDetector.markForCheck();
  }

  public toggleRowSelected(toggledRow: StatefulTableRow): void {
    const previousSelections = this.selections ?? [];
    const deselectedRow = previousSelections.find(selection => isEqualIgnoreFunctions(selection, toggledRow));
    if (deselectedRow !== undefined) {
      this.selections = without(previousSelections, deselectedRow);
    } else if (this.hasMultiSelect()) {
      this.selections = [...previousSelections, toggledRow];
    } else {
      this.selections = [toggledRow];
    }
    this.selectionsChange.emit(this.selections);
    this.changeDetector.markForCheck();
  }

  public toggleRowExpanded(row: StatefulTableRow): void {
    row.$$state.expanded = !row.$$state.expanded;
    this.rowStateSubject.next(row);
    this.toggleRowChange.emit(row);
    this.changeDetector.markForCheck();
  }

  public expandAllRows(): void {
    if (this.dataSource) {
      this.dataSource.expandAllRows();
      this.toggleAllChange.emit(true);
      this.changeDetector.markForCheck();
    }
  }

  public collapseAllRows(): void {
    if (this.dataSource) {
      this.dataSource.collapseAllRows();
      this.toggleAllChange.emit(false);
      this.changeDetector.markForCheck();
    }
  }

  public isExpanderColumn(columnConfig: TableColumnConfig): boolean {
    return columnConfig.display === this.expandableToggleColumnConfig.display;
  }

  public shouldHighlightRowAsSelection(row: StatefulTableRow): boolean {
    return (
      this.selectionMode !== TableSelectionMode.Multiple &&
      this.selections !== undefined &&
      this.selections.find(selection => TableCdkRowUtil.isEqualExceptState(selection, row)) !== undefined
    );
  }

  public isHoveredRow(row: StatefulTableRow): boolean {
    return this.hovered !== undefined && TableCdkRowUtil.isEqualExceptState(row, this.hovered);
  }

  public isChildRow(row: StatefulTableRow): boolean {
    return !!row.$$state.parent;
  }

  public isDetailType(): boolean {
    return this.mode === TableMode.Detail;
  }

  public isTreeType(): boolean {
    return this.mode === TableMode.Tree;
  }

  public isShowHeader(): boolean {
    return this.display !== TableStyle.List;
  }

  public hasExpandableRows(): boolean {
    return this.isDetailType() || this.isTreeType();
  }

  public isDetailExpanded(row: StatefulTableRow): boolean {
    return this.isDetailType() && row.$$state.expanded;
  }

  public hasSelectableRows(): boolean {
    return this.hasSingleSelect() || this.hasMultiSelect();
  }

  public hasSingleSelect(): boolean {
    return this.selectionMode === TableSelectionMode.Single;
  }

  public hasMultiSelect(): boolean {
    return this.selectionMode === TableSelectionMode.Multiple;
  }

  public isRowExpanded(row: StatefulTableRow): boolean {
    return this.hasExpandableRows() && row.$$state.expanded;
  }

  public onPageChange(pageEvent: PageEvent): void {
    if (this.syncWithUrl) {
      this.navigationService.addQueryParametersToUrl({
        [TableComponent.PAGE_INDEX_URL_PARAM]: pageEvent.pageIndex,
        [TableComponent.PAGE_SIZE_URL_PARAM]: pageEvent.pageSize
      });
    }

    if (this.selections && this.selections.length > 0) {
      this.selections = [];
      this.selectionsChange.emit(this.selections);
    }

    this.pageChange.emit(pageEvent);
  }

  private getNextSortDirection(sortDirection?: TableSortDirection): TableSortDirection | undefined {
    // Order: undefined -> Ascending -> Descending -> undefined
    switch (sortDirection) {
      case TableSortDirection.Ascending:
        return TableSortDirection.Descending;
      case TableSortDirection.Descending:
        return undefined;
      default:
        return TableSortDirection.Ascending;
    }
  }

  private getPageData(params: ParamMap): Partial<PageEvent> | undefined {
    return this.syncWithUrl
      ? {
          pageSize: new NumberCoercer({ defaultValue: this.pageSize }).coerce(
            params.get(TableComponent.PAGE_SIZE_URL_PARAM)
          ),
          pageIndex: new NumberCoercer().coerce(params.get(TableComponent.PAGE_INDEX_URL_PARAM))
        }
      : undefined;
  }

  private sortDataFromUrl(params: ParamMap, columns: TableColumnConfigExtended[]): Required<SortedColumn> | undefined {
    if (!this.syncWithUrl) {
      return undefined;
    }

    const sortColumn = columns.find(column => column.id === params.get(TableComponent.SORT_COLUMN_URL_PARAM));
    const sortDirection = params.get(TableComponent.SORT_DIRECTION_URL_PARAM) as TableSortDirection | null;

    return sortColumn !== undefined && sortDirection !== null
      ? {
          column: sortColumn,
          direction: sortDirection
        }
      : undefined;
  }
}

interface SortedColumn {
  column: TableColumnConfigExtended;
  direction?: TableSortDirection;
}

interface ColumnBounds {
  left: number;
  right: number;
}

interface ResizeColumns {
  left: ColumnInfo;
  right: ColumnInfo;
}

interface ColumnInfo {
  config: TableColumnConfigExtended;
  element: HTMLElement;
  bounds: ColumnBounds;
}
