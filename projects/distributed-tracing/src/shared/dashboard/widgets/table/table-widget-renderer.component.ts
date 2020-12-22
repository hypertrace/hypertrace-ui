import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { isEqualIgnoreFunctions, isNonEmptyString, PreferenceService } from '@hypertrace/common';
import {
  FilterAttribute,
  FilterOperator,
  StatefulTableRow,
  TableColumnConfig,
  TableDataSource,
  TableFilter,
  TableMode,
  TableRow,
  TableSelectionMode,
  TableStyle,
  ToggleItem
} from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { capitalize, isEmpty, pick } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, map, pairwise, share, startWith, switchMap, tap } from 'rxjs/operators';
import { AttributeMetadata, toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from '../../interaction/interaction-handler';
import { ModeToggleTableWidgetModel } from './mode-toggle-table-widget.model';
import { TableWidgetBaseModel } from './table-widget-base.model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetFilterModel } from './table-widget-filter-model';
import { TableWidgetModel } from './table-widget.model';

@Renderer({ modelClass: TableWidgetModel })
@Renderer({ modelClass: ModeToggleTableWidgetModel })
@Component({
  selector: 'ht-table-widget-renderer',
  styleUrls: ['./table-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content
      [title]="this.model.header?.title | htDisplayTitle"
      [link]="this.model.header?.link?.url"
      [linkLabel]="this.model.header?.link?.displayText"
    >
      <div class="table-content-container">
        <ht-table-controls
          class="table-controls"
          [searchEnabled]="!!this.api.model.searchAttribute"
          [filterItems]="this.filterItems"
          [modeItems]="this.modeItems"
          [checkboxLabel]="this.model.getCheckboxFilterOption()?.label"
          [checkboxChecked]="this.model.getCheckboxFilterOption()?.checked"
          (checkboxCheckedChange)="this.onCheckboxCheckedChange($event)"
          (searchChange)="this.onSearchChange($event)"
          (filterChange)="this.onFilterChange($event)"
          (modeChange)="this.onModeChange($event)"
        >
        </ht-table-controls>

        <ht-table
          class="table"
          [ngClass]="{ 'header-margin': this.model.header?.topMargin }"
          [columnConfigs]="this.columnConfigs$ | async"
          [metadata]="this.metadata$ | async"
          [mode]="this.activeMode"
          [selectionMode]="this.model.getSelectionMode()"
          [display]="this.model.style"
          [data]="this.data$ | async"
          [filters]="this.combinedFilters$ | async"
          [pageable]="this.api.model.isPageable()"
          [detailContent]="childDetail"
          [syncWithUrl]="this.syncWithUrl"
          (selectionsChange)="this.onRowSelection($event)"
          (columnConfigsChange)="this.onColumnsChange($event)"
        >
        </ht-table>
      </div>
    </ht-titled-content>

    <ng-template #childDetail let-row="row">
      <ng-container [hdaDashboardModel]="this.getChildModel | htMemoize: row"></ng-container>
    </ng-template>
  `
})
export class TableWidgetRendererComponent
  extends WidgetRenderer<TableWidgetBaseModel, TableDataSource<TableRow> | undefined>
  implements OnInit {
  public filterItems: ToggleItem<TableWidgetFilterModel>[] = [];
  public modeItems: ToggleItem<TableMode>[] = [];
  public activeMode!: TableMode;

  public metadata$!: Observable<FilterAttribute[]>;
  public columnConfigs$!: Observable<TableColumnConfig[]>;
  public combinedFilters$!: Observable<TableFilter[]>;

  private readonly toggleFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  private readonly searchFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  private readonly checkboxFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);

  private selectedRowInteractionHandler?: InteractionHandler;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TableWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly metadataService: MetadataService,
    private readonly preferenceService: PreferenceService
  ) {
    super(api, changeDetector);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.onModeChange(this.model.mode);

    this.metadata$ = this.getScopeAttributes();
    this.columnConfigs$ = (isNonEmptyString(this.model.id)
      ? this.preferenceService.get<TableColumnConfig[]>(this.model.id, [])
      : of([])
    ).pipe(switchMap(persistedColumns => this.getColumnConfigs(persistedColumns)));

    this.combinedFilters$ = combineLatest([
      this.toggleFilterSubject,
      this.searchFilterSubject,
      this.checkboxFilterSubject
    ]).pipe(
      map(([toggleFilters, searchFilters, checkboxFilter]) => [...toggleFilters, ...searchFilters, ...checkboxFilter])
    );

    this.filterItems = this.model.getFilterOptions().map(filterOption => ({
      label: capitalize(filterOption.label),
      value: filterOption
    }));

    this.modeItems = this.model.getModeOptions().map(modeOption => ({
      label: capitalize(modeOption),
      value: modeOption
    }));

    this.maybeEmitInitialCheckboxFilterChange();
  }

  public getChildModel = (row: TableRow): object | undefined => this.model.getChildModel(row);

  protected fetchData(): Observable<TableDataSource<TableRow> | undefined> {
    return this.model.getData().pipe(startWith(undefined));
  }

  public get syncWithUrl(): boolean {
    return this.model.style === TableStyle.FullPage;
  }

  private getScope(): Observable<string | undefined> {
    return this.data$!.pipe(map(data => data?.getScope()));
  }

  private getColumnConfigs(persistedColumns: TableColumnConfig[] = []): Observable<TableColumnConfig[]> {
    return combineLatest([
      this.getScope(),
      this.api.change$.pipe(
        map(() => true),
        startWith(true)
      )
    ]).pipe(
      switchMap(([scope]) => this.model.getColumns(scope)),
      startWith([]),
      map((columns: SpecificationBackedTableColumnDef[]) =>
        this.applySavedColumnPreferences(columns, persistedColumns)
      ),
      pairwise(),
      filter(([previous, current]) => !isEqualIgnoreFunctions(previous, current)),
      map(([_, current]) => current),
      share(),
      tap(() => this.onDashboardRefresh())
    );
  }

  private applySavedColumnPreferences(
    columns: SpecificationBackedTableColumnDef[],
    persistedColumns: TableColumnConfig[]
  ): SpecificationBackedTableColumnDef[] {
    return columns.map(column => {
      const found = persistedColumns.find(persistedColumn => persistedColumn.id === column.id);

      return {
        ...column, // Apply default column config
        ...(found ? found : {}) // Override with any saved properties
      };
    });
  }

  private getScopeAttributes(): Observable<FilterAttribute[]> {
    return this.getScope().pipe(
      switchMap(scope => {
        if (scope === undefined) {
          return of([]);
        }

        return this.metadataService.getFilterAttributes(scope);
      }),
      map((attributes: AttributeMetadata[]) =>
        attributes.map(attribute => ({
          ...attribute,
          type: toFilterAttributeType(attribute.type)
        }))
      )
    );
  }

  public onFilterChange(item: ToggleItem<TableWidgetFilterModel>): void {
    if (item.value && item.value.attribute && item.value.operator && item.value.value !== undefined) {
      this.toggleFilterSubject.next([
        {
          field: item.value.attribute,
          operator: item.value.operator,
          value: item.value.value
        }
      ]);

      return;
    }

    this.toggleFilterSubject.next([]);
  }

  public onCheckboxCheckedChange(checked: boolean): void {
    const tableFilter = this.model.getCheckboxFilterOption()?.getTableFilter(checked);
    this.checkboxFilterSubject.next(tableFilter ? [tableFilter] : []);
  }

  public onSearchChange(text: string): void {
    const searchFilter: TableFilter = {
      field: this.api.model.searchAttribute!,
      operator: FilterOperator.Like,
      value: text
    };
    this.searchFilterSubject.next([searchFilter]);
  }

  public onModeChange(mode: TableMode): void {
    this.activeMode = mode;
    this.model.setMode(mode);
    this.columnConfigs$ = this.getColumnConfigs();
  }

  public onColumnsChange(columns: TableColumnConfig[]): void {
    if (isNonEmptyString(this.model.id)) {
      this.preferenceService.set(
        this.model.id,
        columns.map(column => this.pickPersistColumnProperties(column))
      );
    }
  }

  private pickPersistColumnProperties(column: TableColumnConfig): Pick<TableColumnConfig, 'id' | 'visible'> {
    /*
     * Note: The table columns have nested methods, so those are lost here when persistService uses JSON.stringify
     * to convert and store. We want to just pluck the relevant properties that are required to be saved.
     */
    return pick(column, ['id', 'visible']);
  }

  public onRowSelection(selections: StatefulTableRow[]): void {
    if (this.api.model.getSelectionMode() === TableSelectionMode.Single) {
      /**
       * Execute selection handler for single selection mode only
       */
      let selectedRow;
      if (selections.length > 0) {
        selectedRow = selections[0];
        this.selectedRowInteractionHandler = this.getInteractionHandler(selectedRow);
      }

      this.selectedRowInteractionHandler?.execute(selectedRow);
    }
  }

  private maybeEmitInitialCheckboxFilterChange(): void {
    const checkboxFilterModel = this.model.getCheckboxFilterOption();
    if (checkboxFilterModel?.checked !== undefined) {
      this.onCheckboxCheckedChange(checkboxFilterModel.checked);
    }
  }

  private getInteractionHandler(selectedRow: StatefulTableRow): InteractionHandler | undefined {
    const matchedSelectionHandlers = this.api.model
      .getRowSelectionHandlers(selectedRow)
      ?.filter(selectionModel => selectionModel.appliesToCurrentRowDepth(selectedRow.$$state.depth))
      .sort((model1, model2) => model2.rowDepth - model1.rowDepth);

    return !isEmpty(matchedSelectionHandlers) ? matchedSelectionHandlers[0].handler : undefined;
  }
}
