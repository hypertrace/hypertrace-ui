/* eslint-disable max-lines */
/* eslint-disable @angular-eslint/component-max-inline-declarations */
import { ModalService } from '../modal/modal.service';
import {
  TableEditColumnsModalConfig,
  TableEditColumnsModalComponent
} from './columns/table-edit-columns-modal.component';
import { CdkHeaderRow } from '@angular/cdk/table';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  Color,
  Dictionary,
  DomElementMeasurerService,
  isEqualIgnoreFunctions,
  NavigationService,
  NumberCoercer,
  TypedSimpleChanges
} from '@hypertrace/common';
import { isNil, without } from 'lodash-es';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { switchMap, take, filter, map } from 'rxjs/operators';
import { FilterAttribute } from '../filtering/filter/filter-attribute';
import { LoadAsyncConfig } from '../load-async/load-async.service';
import { PageEvent } from '../paginator/page.event';
import { PaginatorComponent } from '../paginator/paginator.component';
import { CoreTableCellRendererType } from './cells/types/core-table-cell-renderer-type';
import { TableCdkColumnUtil } from './data/table-cdk-column-util';
import { TableCdkDataSource } from './data/table-cdk-data-source';
import {
  ColumnConfigProvider,
  ColumnStateChangeProvider,
  FiltersProvider,
  RowStateChangeProvider,
  TableDataSourceProvider
} from './data/table-cdk-data-source-api';
import { TableCdkRowUtil } from './data/table-cdk-row-util';
import { TableDataSource } from './data/table-data-source';
import {
  StatefulTableRow,
  TableColumnConfig,
  TableColumnWidth,
  TableFilter,
  TableMode,
  TableRow,
  TableSelectionMode,
  TableSortDirection,
  TableStyle
} from './table-api';
import { TableColumnConfigExtended, TableService } from './table.service';
import { ModalSize } from '../modal/modal';
import { DOCUMENT } from '@angular/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TableColumnWidthUtil } from './util/column-width.util';

@Component({
  selector: 'ht-table',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table" (htLayoutChange)="this.onLayoutChange()" #table>
      <cdk-table
        *ngIf="this.dataSource"
        #cdkTable
        [multiTemplateDataRows]="this.isDetailType()"
        [dataSource]="this.dataSource"
        [ngClass]="[
          this.display,
          this.pageable && this.isTableFullPage ? 'bottom-margin' : '',
          !this.showFloatingPaginator ? 'table' : ''
        ]"
        cdkDropList
        cdkDropListOrientation="horizontal"
        (cdkDropListDropped)="this.dropList($event)"
      >
        <!-- Columns -->
        <ng-container *ngFor="let columnDef of this.visibleColumnConfigs; trackBy: this.trackItem; index as index">
          <ng-container [cdkColumnDef]="columnDef.id">
            <cdk-header-cell
              [attr.data-column-index]="index"
              *cdkHeaderCellDef
              [ngStyle]="this.getHeaderColumnStyles(columnDef)"
              class="header-cell"
              [ngClass]="{
                'state-col': this.isStateColumn | htMemoize: columnDef,
                'col-border-right': this.isLastStateColumn | htMemoize: this.visibleColumnConfigs:index
              }"
              #headerCell
            >
              <div cdkDrag class="header-cell-container">
                <div class="header-cell-content">
                  <div
                    *ngIf="this.isStateColumn | htMemoize: columnDef; else headerCellRendererTemplate"
                    class="state-cell-container"
                  >
                    <ht-checkbox
                      *ngIf="this.isSelectionStateColumn | htMemoize: columnDef"
                      [htTooltip]="this.getHeaderCheckboxTooltip()"
                      [checked]="this.allRowsSelectionChecked"
                      [indeterminate]="this.indeterminateRowsSelected"
                      (checkedChange)="this.onHeaderAllRowsSelectionChange($event)"
                    ></ht-checkbox>
                    <div
                      *ngIf="this.isExpansionStateColumn | htMemoize: columnDef"
                      [style.width]="columnDef?.width"
                    ></div>
                  </div>

                  <ng-template #headerCellRendererTemplate>
                    <ht-table-header-cell-renderer
                      class="header-cell-renderer"
                      [metadata]="this.metadata"
                      [columnConfig]="columnDef"
                      [defaultColumns]="this.columnDefaultConfigs"
                      [availableColumns]="this.columnConfigs$ | async"
                      [index]="index"
                      [sort]="columnDef.sort"
                      [indeterminateRowsSelected]="this.indeterminateRowsSelected"
                      (sortChange)="this.onSortChange($event, columnDef)"
                      (hideCurrentColumnChange)="this.onHideColumn(columnDef)"
                      (showEditColumnsChange)="this.showEditColumnsModal()"
                    >
                    </ht-table-header-cell-renderer>
                  </ng-template>
                </div>

                <!-- column divider -->
                <div
                  *ngIf="this.showColumnDivider | htMemoize: this.visibleColumnConfigs:index"
                  class="header-column-divider"
                >
                  <div class="bg-col-divider"></div>
                </div>
              </div>

              <!-- column resize handler -->
              <div
                *ngIf="this.showColumnResizeHandler | htMemoize: this.visibleColumnConfigs:index"
                class="header-column-resize-handle"
                (mousedown)="this.onResizeMouseDown($event, index)"
              ></div>
            </cdk-header-cell>
            <cdk-cell
              *cdkCellDef="let row"
              [ngStyle]="this.getDataColumnStyles(columnDef, index, row)"
              [ngClass]="{
                'detail-expanded': this.isDetailExpanded(row),
                'hide-divider': this.isDetailList(),
                'state-col': this.isStateColumn | htMemoize: columnDef,
                'col-border-right': this.isLastStateColumn | htMemoize: this.visibleColumnConfigs:index,
                'depth-greater-than-zero': row.$$state.depth > 0
              }"
              class="data-cell"
            >
              <div
                *ngIf="this.isStateColumn | htMemoize: columnDef; else cellRendererTemplate"
                class="state-cell-container"
              >
                <ht-checkbox
                  *ngIf="this.isSelectionStateColumn | htMemoize: columnDef"
                  [checked]="row.$$state.selected"
                  (checkedChange)="columnDef.onClick?.(row, columnDef)"
                ></ht-checkbox>
                <ht-expander-toggle
                  *ngIf="(this.isExpansionStateColumn | htMemoize: columnDef) && !row.$$state.leaf"
                  [expanded]="row.$$state.expanded"
                  (click)="columnDef.onClick?.(row, columnDef)"
                ></ht-expander-toggle>
              </div>

              <ng-template #cellRendererTemplate>
                <ht-table-data-cell-renderer
                  class="data-cell-renderer"
                  [metadata]="this.metadata"
                  [columnConfig]="columnDef"
                  [index]="this.columnIndex(columnDef, index)"
                  [rowData]="row"
                  [cellData]="row[columnDef.id]"
                  (click)="this.onDataCellClick(row)"
                ></ht-table-data-cell-renderer>
              </ng-template>
            </cdk-cell>
          </ng-container>
        </ng-container>

        <!-- Expandable Detail Column -->
        <ng-container [cdkColumnDef]="this.expandedDetailColumnConfig.id" *ngIf="this.isDetailType()">
          <ng-container *htLetAsync="this.columnConfigs$ as columnConfigs">
            <cdk-cell *cdkCellDef="let row" [attr.colspan]="columnConfigs.length" class="expanded-cell">
              <ht-table-expanded-detail-row-cell-renderer
                [row]="row"
                [expanded]="this.isRowExpanded(row)"
                [content]="this.detailContent"
              ></ht-table-expanded-detail-row-cell-renderer>
            </cdk-cell>
          </ng-container>
        </ng-container>

        <!-- Header Row -->
        <ng-container *ngIf="this.isShowHeader()">
          <cdk-header-row *cdkHeaderRowDef="this.visibleColumnIds" class="header-row" sticky></cdk-header-row>
        </ng-container>

        <!-- Data Rows -->
        <cdk-row
          cdk-row
          *cdkRowDef="let row; columns: this.visibleColumnIds; last as isLast"
          (mouseenter)="this.onDataRowMouseEnter(row)"
          (mouseleave)="this.onDataRowMouseLeave()"
          [ngClass]="{
            'selected-row': this.shouldHighlightRowAsSelection(row),
            'hovered-row': this.isHoveredRow(row),
            'last-row': isLast,
            selectable: this.supportsRowSelection()
          }"
          class="data-row"
          [ngStyle]="this.getRowStyle()"
        ></cdk-row>

        <!-- Expandable Detail Rows -->
        <ng-container *ngIf="this.isDetailType()">
          <cdk-row *cdkRowDef="let row; columns: [this.expandedDetailColumnConfig.id]" class="expandable-row"></cdk-row>
        </ng-container>
      </cdk-table>

      <!-- State Watcher -->
      <ng-container *ngIf="this.dataSource?.loadingStateChange$ | async as loadingState">
        <!-- eslint-disable @angular-eslint/template/cyclomatic-complexity -->
        <div class="state-watcher" *ngIf="!loadingState.hide">
          <ng-container
            class="state-watcher"
            *htLoadAsync="loadingState.loading$; config: this.loadingConfig"
          ></ng-container>
        </div>
      </ng-container>

      <!-- Pagination -->
      <!-- eslint-disable @angular-eslint/template/cyclomatic-complexity -->
      <div
        class="pagination-controls"
        *ngIf="this.pageable"
        [style.position]="!this.showFloatingPaginator ? (this.isTableFullPage ? 'fixed' : 'sticky') : ''"
      >
        <ht-paginator
          *htLetAsync="this.currentPage$ as pagination"
          [pageSizeOptions]="this.pageSizeOptions"
          [pageSize]="pagination?.pageSize"
          [pageIndex]="pagination?.pageIndex"
          (pageChange)="this.onPageChange($event)"
          (recordsDisplayedChange)="this.recordsDisplayedChange.emit($event)"
          (totalRecordsChange)="this.totalRecordsChange.emit($event)"
        ></ht-paginator>
      </div>
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
    FiltersProvider,
    ColumnStateChangeProvider,
    RowStateChangeProvider {
  private static readonly PAGE_INDEX_URL_PARAM: string = 'page';
  private static readonly PAGE_SIZE_URL_PARAM: string = 'page-size';
  private static readonly SORT_COLUMN_URL_PARAM: string = 'sort-by';
  private static readonly SORT_DIRECTION_URL_PARAM: string = 'sort-direction';
  private static readonly SCROLLBAR_WIDTH_IN_PX: number = 15;
  private static readonly MIN_COLUMN_SIZE_PX: number = 12;
  private static readonly COLUMN_RESIZE_HANDLER_COLOR: string = Color.Blue4;
  public readonly minColumnWidth: string = '100px';
  private readonly expandableToggleColumnConfig: TableColumnConfig = {
    id: '$$expanded',
    width: '32px',
    visible: true,
    display: CoreTableCellRendererType.RowExpander,
    onClick: (row: StatefulTableRow) => this.toggleRowExpanded(row)
  };

  private readonly multiSelectRowColumnConfig: TableColumnConfig = {
    id: '$$selected',
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
  public filters?: TableFilter[];

  @Input()
  public queryProperties?: Dictionary<unknown> = {};

  @Input()
  public mode?: TableMode = TableMode.Flat;

  @Input()
  public display?: TableStyle = TableStyle.Embedded;

  @Input()
  public selectionMode?: TableSelectionMode = TableSelectionMode.Single;

  @Input()
  public title?: string;

  @Input()
  public pageable?: boolean = true;

  @Input()
  public resizable?: boolean = true;

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
  public pageSize?: number = 50;

  @Input()
  public showFloatingPaginator?: boolean = false;

  @Input()
  public loadingConfig?: LoadAsyncConfig;

  // TODO: Rename rowHeight to minRowHeight
  @Input()
  public rowHeight: string = '44px';

  @Input()
  public maxRowHeight?: string;

  @Output()
  public readonly rowClicked: EventEmitter<StatefulTableRow> = new EventEmitter<StatefulTableRow>();

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

  @Output()
  public readonly recordsDisplayedChange: EventEmitter<number> = new EventEmitter();

  @Output()
  public readonly totalRecordsChange: EventEmitter<number> = new EventEmitter();

  @Output()
  public readonly columnConfigsChange: EventEmitter<TableColumnConfig[]> = new EventEmitter<TableColumnConfig[]>();

  @Output()
  public readonly sortChange: EventEmitter<SortedColumn<TableColumnConfig>> = new EventEmitter<
    SortedColumn<TableColumnConfig>
  >();

  @ViewChild(PaginatorComponent)
  public paginator?: PaginatorComponent;

  @ViewChild('table', { read: ElementRef })
  private readonly table!: ElementRef;

  @ViewChild('cdkTable', { read: ElementRef })
  private readonly cdkTable!: ElementRef;

  @ViewChild(CdkHeaderRow, { read: ElementRef })
  public headerRowElement!: ElementRef;

  @ViewChildren('headerCell', { read: ElementRef })
  public headerCells!: QueryList<ElementRef>;

  /*
   * Column Config
   */
  private readonly columnConfigsSubject: BehaviorSubject<TableColumnConfigExtended[]> = new BehaviorSubject<
    TableColumnConfigExtended[]
  >([]);
  public readonly columnConfigs$: Observable<TableColumnConfigExtended[]> = this.columnConfigsSubject.asObservable();
  public columnDefaultConfigs?: TableColumnConfigExtended[];

  public visibleColumnConfigs: TableColumnConfigExtended[] = [];
  public visibleColumnIds: string[] = [];

  /*
   * Column State
   */
  private readonly columnStateSubject: BehaviorSubject<TableColumnConfigExtended | undefined> = new BehaviorSubject<
    TableColumnConfigExtended | undefined
  >(undefined);
  public readonly columnState$: Observable<
    TableColumnConfigExtended | undefined
  > = this.columnStateSubject.asObservable();

  /*
   * Row State
   */
  private readonly rowStateSubject: BehaviorSubject<StatefulTableRow | undefined> = new BehaviorSubject<
    StatefulTableRow | undefined
  >(undefined);
  public readonly rowState$: Observable<StatefulTableRow | undefined> = this.rowStateSubject.asObservable();

  /*
   * Filters
   */
  private readonly filtersSubject: BehaviorSubject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  public readonly filters$: Observable<TableFilter[]> = this.filtersSubject.asObservable();
  private readonly queryPropertiesSubject: BehaviorSubject<Dictionary<unknown>> = new BehaviorSubject<
    Dictionary<unknown>
  >({});
  public readonly queryProperties$: Observable<Dictionary<unknown>> = this.queryPropertiesSubject.asObservable();

  /*
   * Pagination
   */
  // For pushing changes to the page explicitly
  private readonly pageSubject: Subject<Partial<PageEvent>> = new Subject();
  // When route, sort or filters change, reset pagination
  public readonly paginationReset$: Observable<Partial<PageEvent>> = combineLatest([
    this.activatedRoute.queryParamMap,
    this.columnState$,
    this.filters$
  ]).pipe(map(([params]) => this.calculateDefaultPagination(params)));
  public readonly currentPage$: Observable<Partial<PageEvent>> = merge(this.pageSubject, this.paginationReset$);

  public dataSource?: TableCdkDataSource;
  public isTableFullPage: boolean = false;

  // Ensures whether columns have Pixel widths or not
  private hasColumnResized: boolean = false;
  private initialColumnConfigIdWidthMap: Map<string, TableColumnWidth> = new Map<string, TableColumnWidth>();

  private tableWidth: number = 0;
  private resizeStartX: number = 0;
  private columnResizeHandler?: HTMLDivElement;
  private resizedColumn?: ColumnInfo;
  public indeterminateRowsSelected?: boolean;
  /**
   *  This is to select all rows on the current page, we do not support selecting entirety of the data
   */
  public allRowsSelectionChecked: boolean = false;

  public constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly elementRef: ElementRef,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly domElementMeasurerService: DomElementMeasurerService,
    private readonly tableService: TableService,
    private readonly modalService: ModalService
  ) {
    combineLatest([this.activatedRoute.queryParamMap, this.columnConfigs$])
      .pipe(
        map(([queryParamMap, columns]) => this.sortDataFromUrl(queryParamMap, columns)),
        filter((sort): sort is Required<SortedColumn<TableColumnConfigExtended>> => sort !== undefined)
      )
      .subscribe(sort => this.updateSort(sort));
  }

  public onLayoutChange(): void {
    const latestTableWidth = this.table.nativeElement.offsetWidth;

    if (this.tableWidth === 0) {
      this.tableWidth = latestTableWidth;

      return;
    }

    if (!this.hasColumnResized) {
      return;
    }

    this.updateColumnWidthsOnTableLayoutChange(latestTableWidth);
  }

  public dropList(event: CdkDragDrop<TableColumnConfigExtended[]>): void {
    if (event) {
      const minIndex = (this.hasMultiSelect() ? 1 : 0) + (this.hasExpandableRows() ? 1 : 0);
      if (event.currentIndex >= minIndex) {
        moveItemInArray(this.visibleColumnConfigs, event.previousIndex, event.currentIndex);
        this.updateVisibleColumns(this.visibleColumnConfigs);
        this.visibleColumnIds = [...this.visibleColumnIds];
      }
    }
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.display) {
      this.isTableFullPage = this.display === TableStyle.FullPage;
    }

    if (changes.mode || changes.columnConfigs || changes.detailContent || changes.metadata) {
      this.initializeColumns();
    }

    if (
      changes.mode ||
      changes.data ||
      changes.filters ||
      changes.queryProperties ||
      changes.pageSize ||
      changes.pageSizeOptions ||
      changes.pageable
    ) {
      this.initializeData();
    }

    // Current and previous selections both should not be empty.
    if (
      changes.selections &&
      !((changes.selections.previousValue?.length ?? 0) === 0 && (changes.selections.currentValue?.length ?? 0) === 0)
    ) {
      this.toggleRowSelections(this.selections);
    }

    if (changes.initialExpandAll && this.initialExpandAll) {
      this.expandAllRows();
    }
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      !this.dataSource && this.initializeData();
      this.initializeColumns();
      this.addEventListeners();
    });
  }

  public ngOnDestroy(): void {
    this.filtersSubject.complete();
    this.queryPropertiesSubject.complete();
    this.rowStateSubject.complete();
    this.columnStateSubject.complete();
    this.columnConfigsSubject.complete();
    this.dataSource?.disconnect();
    this.removeEventListeners();
  }

  public trackItem(_index: number, column: TableColumnConfigExtended): string {
    return `${column.id}-${column.width}`;
  }

  public queryHeaderCellElement(index: number): HTMLElement {
    return this.elementRef.nativeElement.querySelector(`cdk-header-cell[data-column-index="${index}"`);
  }

  private getVisibleColumnConfig(index: number): TableColumnConfigExtended {
    return this.visibleColumnConfigs[index];
  }

  public onResizeMouseDown(event: MouseEvent, index: number): void {
    if (this.resizable) {
      this.columnResizeHandler = event.target as HTMLDivElement;
      this.columnResizeHandler.style.backgroundColor = TableComponent.COLUMN_RESIZE_HANDLER_COLOR;

      this.resizedColumn = this.buildColumnInfo(index);
      this.resizeStartX = event.clientX;

      event.preventDefault();
    }
  }

  public getHeaderCheckboxTooltip(): string {
    return this.indeterminateRowsSelected
      ? 'Some rows are selected'
      : this.allRowsSelectionChecked
      ? 'All rows in the table are selected'
      : 'None of the rows in the table are selected';
  }

  public getRowStyle(): Dictionary<string> {
    return {
      'min-height': this.rowHeight,
      ...(!isNil(this.maxRowHeight) ? { 'max-height': this.maxRowHeight } : {}),
      ...(this.showFloatingPaginator ? { height: this.rowHeight } : {})
    };
  }

  public onResizeMouseMove(event: MouseEvent): void {
    if (this.resizable && this.resizeStartX > 0 && !isNil(this.columnResizeHandler)) {
      this.columnResizeHandler.style.right = `${this.resizeStartX - event.clientX}px`;
    }
  }

  public onResizeMouseUp(event: MouseEvent): void {
    this.checkAndResizeColumn(event);
    this.changeDetector.detectChanges();
  }

  private addEventListeners(): void {
    this.document.addEventListener('mousemove', event => this.onResizeMouseMove(event));
    this.document.addEventListener('mouseup', event => this.onResizeMouseUp(event));
  }

  private removeEventListeners(): void {
    this.document.removeEventListener('mousemove', event => this.onResizeMouseMove(event));
    this.document.removeEventListener('mouseup', event => this.onResizeMouseUp(event));
  }

  private checkAndResizeColumn(event: MouseEvent): void {
    if (!isNil(this.columnResizeHandler) && !isNil(this.resizedColumn)) {
      const offsetX = event.clientX - this.resizeStartX;

      // At least 12px of the width should be there after resize
      if (
        offsetX < 0 &&
        this.resizedColumn.element.offsetWidth - Math.abs(offsetX) < TableComponent.MIN_COLUMN_SIZE_PX
      ) {
        this.setColumnResizeDefaults(this.columnResizeHandler);

        return;
      }

      if (!this.hasColumnResized) {
        this.updateColumnsWithPixelWidths();
      }

      const resizedWidth: TableColumnWidth = `${this.resizedColumn.element.offsetWidth + offsetX}px`;
      this.resizedColumn.config.width = resizedWidth;
      this.initialColumnConfigIdWidthMap.set(this.resizedColumn.config.id, resizedWidth);
      this.setColumnResizeDefaults(this.columnResizeHandler);
      this.hasColumnResized = true;
    }
  }

  private updateColumnsWithPixelWidths(): void {
    if (!isNil(this.headerCells)) {
      (this.headerCells as QueryList<ElementRef<HTMLElement>>).forEach((cell, index) => {
        const config = this.getVisibleColumnConfig(index);
        config.width = `${cell.nativeElement.offsetWidth}px`;
      });
    }
  }

  private setColumnResizeDefaults(columnResizeHandler: HTMLDivElement): void {
    columnResizeHandler.style.backgroundColor = Color.Transparent;
    columnResizeHandler.style.right = '2px';
    this.columnResizeHandler = undefined;
    this.resizeStartX = 0;
    this.resizedColumn = undefined;
  }

  private buildColumnInfo(index: number): ColumnInfo {
    const element = this.queryHeaderCellElement(index);
    const boundingBox = this.domElementMeasurerService.measureHtmlElement(element);

    return {
      config: this.getVisibleColumnConfig(index),
      element: element,
      bounds: {
        // We add additional padding so a portion of the column remains visible to resize (asymmetry due to resize-handle)
        left: boundingBox.left + 12,
        right: boundingBox.left + boundingBox.width - 8
      }
    };
  }

  private initializeColumns(columnConfigs?: TableColumnConfigExtended[]): void {
    (columnConfigs ?? this.columnConfigs ?? []).forEach(column => {
      this.checkColumnWidthCompatibilityOrThrow(column.width);
      this.checkColumnWidthCompatibilityOrThrow(column.minWidth);
    });
    const columnConfigurations = this.buildColumnConfigExtendeds(columnConfigs ?? this.columnConfigs ?? []);
    if (isNil(this.columnDefaultConfigs)) {
      this.columnDefaultConfigs = columnConfigurations;
    }
    const visibleColumns = columnConfigurations.filter(column => column.visible);
    this.initialColumnConfigIdWidthMap = new Map(visibleColumns.map(column => [column.id, column.width ?? -1]));
    this.updateVisibleColumns(visibleColumns);

    this.columnConfigsSubject.next(columnConfigurations);
  }

  private checkColumnWidthCompatibilityOrThrow(width?: TableColumnWidth): void {
    if (!TableColumnWidthUtil.isWidthCompatible(width)) {
      throw new Error(`Column width: ${width} is not compatible`);
    }
  }

  private updateVisibleColumns(visibleColumnConfigs: TableColumnConfigExtended[]): void {
    this.visibleColumnConfigs = visibleColumnConfigs;
    this.visibleColumnIds = this.visibleColumnConfigs.map(column => column.id);
  }

  private initializeData(): void {
    if (!this.canBuildDataSource()) {
      this.dataSource = undefined;

      return;
    }

    this.dataSource?.disconnect();
    this.dataSource = this.buildDataSource();

    this.dataSource?.loadingStateChange$.subscribe(() => {
      this.tableService.updateFilterValues(this.columnConfigsSubject.value, this.dataSource!); // Mutation! Ew!
    });
    this.filtersSubject.next(this.filters || []);
    this.queryPropertiesSubject.next(this.queryProperties || {});

    this.initializeRows();
  }

  private initializeRows(): void {
    this.rowStateSubject.next(undefined);
    this.toggleRowSelections(this.selections);
  }

  private canBuildDataSource(): boolean {
    return !!this.data && !!this.columnConfigs && (this.pageable ? !!this.paginator : true);
  }

  public showColumnDivider = (columns: TableColumnConfig[], index: number): boolean => {
    if (index === columns.length - 1) {
      return false;
    }

    if (this.isStateColumn(columns[index])) {
      return false;
    }

    return true;
  };

  public showColumnResizeHandler = (columns: TableColumnConfig[], index: number): boolean => {
    if (!(this.resizable ?? true)) {
      return false;
    }

    if (index === columns.length - 1) {
      return true;
    }

    return this.showColumnDivider(columns, index);
  };

  public isSelectionStateColumn = (column?: TableColumnConfig): boolean => column?.id === '$$selected';

  public isExpansionStateColumn = (column?: TableColumnConfig): boolean => column?.id === '$$expanded';

  public isStateColumn = (column?: TableColumnConfig): boolean =>
    this.isSelectionStateColumn(column) || this.isExpansionStateColumn(column);

  public isLastStateColumn = (columns: TableColumnConfig[], index: number): boolean => {
    if (this.isStateColumn(columns[index]) && !this.isStateColumn(columns[index + 1])) {
      return true;
    }

    return false;
  };

  public onSortChange(direction: TableSortDirection, columnConfig: TableColumnConfigExtended): void {
    if (TableCdkColumnUtil.isColumnSortable(columnConfig)) {
      const sortedColumn: SortedColumn<TableColumnConfigExtended> = {
        column: columnConfig,
        direction: direction
      };
      this.sortChange.emit(sortedColumn);
      this.updateSort(sortedColumn);
    }

    if (this.syncWithUrl) {
      this.navigationService.addQueryParametersToUrl({
        [TableComponent.SORT_COLUMN_URL_PARAM]: columnConfig.sort === undefined ? undefined : columnConfig.id,
        [TableComponent.SORT_DIRECTION_URL_PARAM]: columnConfig.sort
      });
    }
  }

  public onHideColumn(column: TableColumnConfigExtended): void {
    column.visible = false;
    const updatedColumns = this.columnConfigsSubject.value;
    this.updateVisibleColumns(updatedColumns.filter(c => c.visible));
    this.distributeWidthToColumns(TableColumnWidthUtil.getColWidthInPx(column.width));
    this.columnConfigsSubject.next(updatedColumns);
  }

  public showEditColumnsModal(): void {
    this.columnConfigs$
      .pipe(
        take(1),
        switchMap(
          availableColumns =>
            this.modalService.createModal<TableEditColumnsModalConfig, TableColumnConfigExtended[]>({
              content: TableEditColumnsModalComponent,
              size: ModalSize.Medium,
              showControls: true,
              title: 'Edit Columns',
              data: {
                availableColumns: availableColumns,
                defaultColumns: this.columnDefaultConfigs ?? []
              }
            }).closed$
        )
      )
      .subscribe(editedColumnConfigs => {
        this.initializeColumns(editedColumnConfigs);
      });
  }

  public onHeaderAllRowsSelectionChange(allRowsSelected: boolean): void {
    if (this.hasMultiSelect()) {
      if (allRowsSelected) {
        this.dataSource?.selectAllRows();
        this.selections = this.dataSource?.getAllRows();
        this.allRowsSelectionChecked = true;
      } else {
        this.dataSource?.unselectAllRows();
        this.selections = [];
        this.allRowsSelectionChecked = false;
      }

      this.selectionsChange.emit(this.selections);
      this.indeterminateRowsSelected = false;
      this.changeDetector.markForCheck();
    }
  }

  public onDataCellClick(row: StatefulTableRow): void {
    // NOTE: Cell Renderers generally handle their own clicks. We should only perform table actions here.
    // Propagate the cell click to the row
    this.onDataRowClick(row);
  }

  public onDataRowClick(row: StatefulTableRow): void {
    this.rowClicked.emit(row);
    this.toggleRowSelected(row);
  }

  public onDataRowMouseEnter(row: StatefulTableRow): void {
    this.hovered = row;
    this.hoveredChange.emit(this.hovered);
  }

  public onDataRowMouseLeave(): void {
    this.hovered = undefined;
    this.hoveredChange.emit(this.hovered);
  }

  public calcLeftMarginIndent(row: StatefulTableRow): string {
    return `${row.$$state.depth * 12}px`;
  }

  public calcRightMarginIndent(row: StatefulTableRow, column: TableColumnConfigExtended): string {
    // A static width should be shifted over to account for left margin, a dynamic (flex) width does it intrinsically
    if (column.width !== undefined && typeof column.width === 'string') {
      return `-${row.$$state.depth * 12}px`;
    }

    return '0';
  }

  public columnIndex(columnConfig: TableColumnConfig, index: number): number {
    if (this.isExpanderColumn(columnConfig)) {
      return 0;
    }

    return this.hasExpandableRows() ? index - 1 : index;
  }

  private buildColumnConfigExtendeds(columnConfigs: TableColumnConfig[]): TableColumnConfigExtended[] {
    const stateColumns = [];

    if (this.hasMultiSelect()) {
      stateColumns.push(this.multiSelectRowColumnConfig);
    }

    if (this.hasExpandableRows()) {
      stateColumns.push(this.expandableToggleColumnConfig);
    }

    return this.tableService.buildExtendedColumnConfigs(
      [...stateColumns, ...columnConfigs],
      this.dataSource,
      this.metadata || []
    );
  }

  private buildDataSource(): TableCdkDataSource {
    if (!this.canBuildDataSource()) {
      throw new Error('Undefined data, columnConfigs, or paginator');
    }

    return new TableCdkDataSource(this, this, this, this, this, this.paginator);
  }

  private updateSort(sort: SortedColumn<TableColumnConfigExtended>): void {
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
    this.indeterminateRowsSelected =
      this.selections?.length > 0 && this.selections?.length !== this.dataSource?.getAllRows().length;
    this.changeDetector.detectChanges();
  }

  public toggleRowExpanded(row: StatefulTableRow): void {
    row.$$state.expanded = !row.$$state.expanded;
    /**
     * Only needed for the `tree` type table.
     * For detail type, it is not needed since we're triggering change detection.
     */
    if (this.isTreeType()) {
      this.rowStateSubject.next(row);
    }
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
      this.selections !== undefined &&
      this.selections.find(selection => TableCdkRowUtil.isEqualExceptState(selection, row)) !== undefined
    );
  }

  public isHoveredRow(row: StatefulTableRow): boolean {
    return this.hovered !== undefined && TableCdkRowUtil.isEqualExceptState(row, this.hovered);
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

  public isDetailList(): boolean {
    return this.isDetailType() && this.display === TableStyle.List;
  }

  public isDetailExpanded(row: StatefulTableRow): boolean {
    return this.isDetailType() && row.$$state.expanded;
  }

  public hasSingleSelect(): boolean {
    return this.selectionMode === TableSelectionMode.Single;
  }

  public hasMultiSelect(): boolean {
    return this.selectionMode === TableSelectionMode.Multiple;
  }

  public supportsRowSelection(): boolean {
    return this.hasMultiSelect() || this.hasSingleSelect();
  }

  public isRowExpanded(row: StatefulTableRow): boolean {
    return this.hasExpandableRows() && row.$$state.expanded;
  }

  public getHeaderColumnStyles(column: TableColumnConfigExtended): Dictionary<string | number | undefined> {
    return {
      'max-width': TableColumnWidthUtil.getWidth(column.width),
      'min-width': TableColumnWidthUtil.getMinWidth(column.minWidth),
      'flex-grow': TableColumnWidthUtil.getFlexGrow(column.width),
      'flex-basis': TableColumnWidthUtil.getFlexBasis(column.width)
    };
  }

  public getDataColumnStyles = (
    column: TableColumnConfigExtended,
    index: number,
    row: StatefulTableRow
  ): Dictionary<string | number | undefined> => ({
    ...this.getHeaderColumnStyles(column),
    'margin-left': index === 0 ? this.calcLeftMarginIndent(row) : 0,
    'margin-right': index === 1 ? this.calcRightMarginIndent(row, column) : 0
  });

  public onPageChange(pageEvent: PageEvent): void {
    this.pageSubject.next(pageEvent);
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

    this.onHeaderAllRowsSelectionChange(false);
    this.pageChange.emit(pageEvent);
  }

  private calculateDefaultPagination(params: ParamMap): Partial<PageEvent> {
    return this.syncWithUrl
      ? {
          pageSize: new NumberCoercer({ defaultValue: this.pageSize }).coerce(
            params.get(TableComponent.PAGE_SIZE_URL_PARAM)
          ),
          pageIndex: new NumberCoercer().coerce(params.get(TableComponent.PAGE_INDEX_URL_PARAM))
        }
      : {
          pageSize: this.pageSize,
          pageIndex: 0
        };
  }

  private sortDataFromUrl(
    params: ParamMap,
    columns: TableColumnConfigExtended[]
  ): Required<SortedColumn<TableColumnConfigExtended>> | undefined {
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

  private updateColumnWidthsOnTableLayoutChange(latestWidth: number): void {
    if (!this.hasColumnResized) {
      return;
    }

    this.tableWidth = latestWidth;
    let totalColWidth = 0;

    this.visibleColumnConfigs.forEach(column => {
      const columnWidthInPx = TableColumnWidthUtil.getColWidthInPx(column.width);

      totalColWidth += columnWidthInPx;
    });

    if (totalColWidth >= latestWidth) {
      return;
    }

    this.distributeWidthToColumns(latestWidth - totalColWidth);
  }

  private distributeWidthToColumns(pixelWidth: number): void {
    if (!this.hasColumnResized) {
      return;
    }

    const tableHeightOffset = this.table.nativeElement.scrollHeight - this.table.nativeElement.offsetHeight;
    const cdkTableHeightOffset = this.cdkTable.nativeElement.scrollHeight - this.cdkTable.nativeElement.offsetHeight;
    const hasScrollbar = tableHeightOffset > 0 || cdkTableHeightOffset > 0;

    const width = pixelWidth - (hasScrollbar ? TableComponent.SCROLLBAR_WIDTH_IN_PX : 0);

    const nonStateResizableVisibleColumnConfigs = this.visibleColumnConfigs
      .filter(column => !this.isStateColumn(column))
      .filter(column => !TableColumnWidthUtil.isPxWidthColumn(this.initialColumnConfigIdWidthMap.get(column.id) ?? -1));

    const widthPerColumn =
      nonStateResizableVisibleColumnConfigs.length > 0 ? width / nonStateResizableVisibleColumnConfigs.length : 0;

    nonStateResizableVisibleColumnConfigs.forEach(column => {
      const columnWidthInPx = TableColumnWidthUtil.getColWidthInPx(column.width);

      column.width = `${columnWidthInPx + widthPerColumn}px`;
    });
  }
}

export interface SortedColumn<TCol extends TableColumnConfig> {
  column: TCol;
  direction?: TableSortDirection;
}

interface ColumnBounds {
  left: number;
  right: number;
}

interface ColumnInfo {
  config: TableColumnConfigExtended;
  element: HTMLElement;
  bounds: ColumnBounds;
}
