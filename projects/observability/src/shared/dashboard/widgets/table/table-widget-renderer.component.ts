/* eslint-disable max-lines */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  assertUnreachable,
  Dictionary,
  forkJoinSafeEmpty,
  isEqualIgnoreFunctions,
  isNonEmptyString,
  PreferenceService,
  StorageType
} from '@hypertrace/common';
import {
  FilterAttribute,
  FilterOperator,
  StatefulTableRow,
  TableCheckboxChange,
  TableCheckboxControl,
  TableCheckboxControlOption,
  TableCheckboxOptions,
  TableColumnConfig,
  TableControlOption,
  TableControlOptionType,
  TableDataSource,
  TableFilter,
  TableFilterControlOption,
  TableRow,
  TableSelectChange,
  TableSelectControl,
  TableSelectControlOption,
  TableStyle,
  ToggleItem,
  toInFilter
} from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { capitalize, isEmpty, isEqual, pick } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
  filter,
  first,
  map,
  mapTo,
  pairwise,
  share,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { AttributeMetadata, toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';
import {
  GlobalCsvDownloadDataType,
  GlobalCsvDownloadService
} from '../../../services/global-csv-download/global-csv-download.service';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from '../../interaction/interaction-handler';
import { TableWidgetRowInteractionModel } from './selections/table-widget-row-interaction.model';
import { TableWidgetBaseModel } from './table-widget-base.model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetControlSelectOptionModel } from './table-widget-control-select-option.model';
import { TableWidgetViewToggleModel } from './table-widget-view-toggle.model';
import { TableWidgetModel } from './table-widget.model';

@Renderer({ modelClass: TableWidgetModel })
@Renderer({ modelClass: TableWidgetViewToggleModel })
@Component({
  selector: 'ht-table-widget-renderer',
  styleUrls: ['./table-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content
      class="table-title"
      [title]="this.model.header?.title | htDisplayTitle"
      [link]="this.model.header?.link?.url"
      [linkLabel]="this.model.header?.link?.displayText"
    >
      <div class="table-content-container" [class.titled]="this.model.header?.title !== undefined">
        <ht-table-controls
          class="table-controls"
          [searchEnabled]="!!this.api.model.getSearchAttribute()"
          [searchPlaceholder]="this.api.model.getSearchPlaceholder()"
          [selectControls]="this.selectControls$ | async"
          [checkboxControls]="this.checkboxControls$ | async"
          [selectedRows]="this.selectedRows"
          [customControlContent]="(this.isCustomControlPresent | htMemoize) ? customControlDetail : undefined"
          [viewItems]="this.viewItems"
          [activeViewItem]="this.activeViewItem$ | async"
          (searchChange)="this.onSearchChange($event)"
          (selectChange)="this.onSelectChange($event)"
          (checkboxChange)="this.onCheckboxChange($event)"
          (viewChange)="this.onViewChange($event)"
        >
        </ht-table-controls>

        <ht-table
          class="table"
          [columnConfigs]="this.columnConfigs$ | async"
          [metadata]="this.metadata$ | async"
          [mode]="this.model.mode"
          [selectionMode]="this.model.getSelectionMode()"
          [display]="this.model.style"
          [data]="this.data$ | async"
          [loadingConfig]="this.model.getLoadingConfig()"
          [filters]="this.combinedFilters$ | async"
          [queryProperties]="this.queryProperties$ | async"
          [pageable]="this.api.model.isPageable()"
          [resizable]="this.api.model.isResizable()"
          [detailContent]="childDetail"
          [syncWithUrl]="this.syncWithUrl"
          [rowHeight]="this.api.model.getRowHeight()"
          [maxRowHeight]="this.api.model.getMaxRowHeight()"
          (rowClicked)="this.onRowClicked($event)"
          (selectionsChange)="this.onRowSelection($event)"
          (columnConfigsChange)="this.onColumnsChange($event)"
          (visibleColumnsChange)="this.onVisibleColumnsChange($event)"
        >
        </ht-table>
      </div>
    </ht-titled-content>

    <ng-template #childDetail let-row="row">
      <ng-container [hdaDashboardModel]="this.getChildModel | htMemoize: row"></ng-container>
    </ng-template>

    <ng-template #customControlDetail let-selectedRows="selectedRows">
      <ng-container [hdaDashboardModel]="this.getCustomControlWidgetModel | htMemoize: selectedRows"></ng-container>
    </ng-template>
  `
})
export class TableWidgetRendererComponent
  extends WidgetRenderer<TableWidgetBaseModel, TableDataSource<TableRow> | undefined>
  implements OnInit {
  private static readonly DEFAULT_TAB_INDEX: number = 0;

  public viewItems: ToggleItem<string>[] = [];
  public activeViewItem$!: Observable<ToggleItem<string>>;

  public selectControls$!: Observable<TableSelectControl[]>;
  public checkboxControls$!: Observable<TableCheckboxControl[]>;

  public metadata$!: Observable<FilterAttribute[]>;
  public columnConfigs$!: Observable<TableColumnConfig[]>;
  public combinedFilters$!: Observable<TableFilter[]>;

  public selectedRows?: StatefulTableRow[] = [];

  private readonly toggleFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  private readonly searchFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  private readonly selectFilterSubject: BehaviorSubject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);

  private readonly queryPropertiesSubject: BehaviorSubject<Dictionary<unknown>> = new BehaviorSubject<
    Dictionary<unknown>
  >({});
  public queryProperties$: Observable<Dictionary<unknown>> = this.queryPropertiesSubject.asObservable();

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TableWidgetModel>,
    changeDetectorRef: ChangeDetectorRef,
    private readonly metadataService: MetadataService,
    private readonly preferenceService: PreferenceService,
    private readonly globalCsvDownloadService: GlobalCsvDownloadService
  ) {
    super(api, changeDetectorRef);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.viewItems = this.model.getViewOptions().map(viewOption => this.buildViewItem(viewOption));

    this.metadata$ = this.getScopeAttributes();

    this.activeViewItem$ = this.getActiveViewItem();

    this.columnConfigs$ = this.getColumnConfigs();

    this.combinedFilters$ = combineLatest([
      this.toggleFilterSubject,
      this.searchFilterSubject,
      this.selectFilterSubject
    ]).pipe(
      map(([toggleFilters, searchFilters, selectFilters]) => [...toggleFilters, ...searchFilters, ...selectFilters])
    );
  }

  public getChildModel = (row: TableRow): object | undefined => this.model.getChildModel(row);

  public isCustomControlPresent = (): boolean => this.model.isCustomControlPresent();

  public getCustomControlWidgetModel = (selectedRows?: TableRow[]): object | undefined =>
    this.model.getCustomControlWidgetModel(selectedRows);

  protected fetchData(): Observable<TableDataSource<TableRow> | undefined> {
    return this.model.getData().pipe(
      startWith(undefined),
      tap(() => this.fetchAndPopulateControlFilters())
    );
  }

  protected fetchAndPopulateControlFilters(): void {
    this.fetchAndPopulateSelectControls();
    this.fetchAndPopulateCheckboxControls();
  }

  protected fetchAndPopulateSelectControls(): void {
    this.selectControls$ = this.getSelectControls().pipe(
      tap((selectControls: TableSelectControl[]) => {
        selectControls.forEach(
          selectControl =>
            selectControl.options.length > 0 &&
            this.publishSelectValuesChange(
              selectControl.options[0].metaValue.field,
              selectControl.options.filter(o => o.applied)
            )
        );
      })
    );
  }

  protected fetchAndPopulateCheckboxControls(): void {
    this.checkboxControls$ = this.getCheckboxControls().pipe(
      tap((checkboxControls: TableCheckboxControl[]) => {
        checkboxControls.forEach(checkboxControl =>
          this.publishCheckboxOptionChange(
            checkboxControl.value ? checkboxControl.options[0] : checkboxControl.options[1]
          )
        );
      })
    );
  }

  private getSelectControls(changed?: TableSelectControl): Observable<TableSelectControl[]> {
    return this.getSessionPreferences().pipe(
      take(1),
      switchMap(preferences =>
        forkJoinSafeEmpty(
          this.model
            .getSelectControlOptions()
            .filter(selectControlModel => selectControlModel.visible)
            .map(selectControlModel => {
              if (selectControlModel.placeholder === changed?.placeholder) {
                return this.buildTableSelectControl(selectControlModel, changed);
              }

              const foundPreferences = preferences.selections
                ? preferences.selections.find(
                    preferencesSelectionControl =>
                      selectControlModel.placeholder === preferencesSelectionControl.placeholder
                  )
                : undefined;

              // Fetch the values for the selectFilter dropdown
              return this.buildTableSelectControl(selectControlModel, foundPreferences);
            })
        )
      )
    );
  }

  private buildTableSelectControl(
    model: TableWidgetControlSelectOptionModel,
    override?: TableSelectControl
  ): Observable<TableSelectControl> {
    return model.getOptions().pipe(
      take(1),
      withLatestFrom(this.selectFilterSubject),
      map(([options, filters]) => {
        const mergedOptions = options.map(option => {
          const found = override?.options.find(o => o.label === option.label);

          return {
            ...option,
            applied: option.applied || found?.applied || this.isFilterApplied(option.metaValue, filters)
          };
        });

        return {
          placeholder: model.placeholder,
          prefix: `${model.placeholder}: `,
          isMultiSelect: model.isMultiselect,
          options: mergedOptions
        };
      })
    );
  }

  private isFilterApplied(filterOption: TableFilter, appliedFilters: TableFilter[]): boolean {
    // This gets just a little tricky because multiple options for a single select could be IN filtered together
    return (
      appliedFilters.find(f => {
        if (isEqual(f, filterOption)) {
          return true;
        }

        if (f.field === filterOption.field && f.operator === FilterOperator.In) {
          return Array.isArray(f.value) && f.value.find(value => value === filterOption.value);
        }
      }) !== undefined
    );
  }

  public get syncWithUrl(): boolean {
    return this.model.style === TableStyle.FullPage;
  }

  private getScope(): Observable<string | undefined> {
    return this.data$!.pipe(map(data => data?.getScope?.()));
  }

  private getActiveViewItem(): Observable<ToggleItem<string>> {
    return this.getViewPreferences().pipe(
      map(preferences => this.hydratePersistedActiveView(this.viewItems, preferences.activeView))
    );
  }

  private getColumnConfigs(): Observable<TableColumnConfig[]> {
    return this.getLocalPreferences().pipe(
      switchMap(preferences =>
        combineLatest([this.getScope(), this.api.change$.pipe(mapTo(true), startWith(true))]).pipe(
          switchMap(([scope]) => this.model.getColumns(scope)),
          startWith([]),
          map((columns: SpecificationBackedTableColumnDef[]) =>
            this.hydratePersistedColumnConfigs(columns, preferences.columns ?? [])
          ),
          pairwise(),
          filter(([previous, current]) => !isEqualIgnoreFunctions(previous, current)),
          map(([_, current]) => current),
          share(),
          tap(() => this.onDashboardRefresh())
        )
      )
    );
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

  public onSelectChange(changed: TableSelectChange): void {
    /*
     * The caller doesn't modify the values, it just returns an array of which values are selected.
     * We must apply the value change to the object, so we set all to false unless found in the changed value array.
     */
    changed.select.options.forEach(
      option =>
        (option.applied = changed.values.find(changedOption => changedOption.label === option.label) !== undefined)
    );
    this.publishSelectValuesChange(changed.select.options[0].metaValue.field, changed.values);

    this.getSelectControls(changed.select).subscribe(tableSelectControls =>
      this.updateSelectionPreferences(tableSelectControls)
    );
  }

  private publishSelectValuesChange(field: string, values: TableSelectControlOption[]): void {
    if (values.length === 0) {
      this.selectFilterSubject.next(this.removeFilters(field));

      return;
    }

    const tableFilters: TableFilter[] = values.map((option: TableFilterControlOption) => option.metaValue);

    this.selectFilterSubject.next(this.mergeFilters(toInFilter(tableFilters)));
  }

  private updateSelectionPreferences(tableSelectControls: TableSelectControl[]): void {
    if (isNonEmptyString(this.model.getId())) {
      this.getSessionPreferences().subscribe(preferences =>
        this.setSessionPreferences({
          ...preferences,
          selections: tableSelectControls
        })
      );
    }
  }

  private publishCheckboxOptionChange(option: TableCheckboxControlOption): void {
    switch (option.type) {
      case TableControlOptionType.Property:
        this.queryPropertiesSubject.next(this.mergeQueryProperties(option.metaValue));
        break;
      case TableControlOptionType.Filter:
        this.selectFilterSubject.next(this.mergeFilters(option.metaValue));
        break;
      case TableControlOptionType.Unset:
        this.selectFilterSubject.next(this.removeFilters(option.metaValue));
        break;
      default:
        assertUnreachable(option);
    }
  }

  public onCheckboxChange(changed: TableCheckboxChange): void {
    this.publishCheckboxOptionChange(changed.option);

    this.checkboxControls$ = this.getCheckboxControls(changed).pipe(
      tap(tableCheckboxControls => this.updateCheckboxPreferences(tableCheckboxControls))
    );
  }

  private updateCheckboxPreferences(tableCheckboxControls: TableCheckboxControl[]): void {
    if (isNonEmptyString(this.model.getId())) {
      this.getSessionPreferences().subscribe(preferences =>
        this.setSessionPreferences({
          ...preferences,
          checkboxes: tableCheckboxControls
        })
      );
    }
  }

  private getCheckboxControls(changed?: TableCheckboxChange): Observable<TableCheckboxControl[]> {
    return this.getSessionPreferences().pipe(
      switchMap(preferences =>
        forkJoinSafeEmpty(
          this.model
            .getCheckboxControlOptions()
            .filter(checkboxControlModel => checkboxControlModel.visible)
            .map(checkboxControlModel =>
              checkboxControlModel.getOptions().pipe(
                take(1),
                map((options: TableCheckboxOptions) => {
                  if (changed !== undefined) {
                    options.forEach(option => {
                      if (this.isLabeledOptionMatch(option, changed.option)) {
                        checkboxControlModel.checked = changed.option.value;
                      }
                    });

                    return {
                      label: checkboxControlModel.checked ? options[0].label : options[1].label,
                      value: checkboxControlModel.checked,
                      options: options
                    };
                  }

                  const found = preferences.checkboxes
                    ? preferences.checkboxes.find(preferencesCheckboxControl =>
                        options.some(option => option.label === preferencesCheckboxControl.label)
                      )
                    : undefined;

                  return (
                    found ?? {
                      label: checkboxControlModel.checked ? options[0].label : options[1].label,
                      value: checkboxControlModel.checked,
                      options: options
                    }
                  );
                })
              )
            )
        )
      )
    );
  }

  private isLabeledOptionMatch(option1: TableControlOption, option2: TableControlOption): boolean {
    return option1.label === option2.label;
  }

  public onSearchChange(text: string): void {
    let searchFilters: TableFilter[] = [];
    // In case of empty string, avoid sending LIKE operator with empty value
    if (isNonEmptyString(text)) {
      searchFilters = [
        {
          field: this.api.model.getSearchAttribute()!,
          operator: FilterOperator.Contains,
          value: text
        }
      ];
    }
    this.searchFilterSubject.next(searchFilters);
  }

  public onViewChange(view: string): void {
    this.model.setView(view);
    if (isNonEmptyString(this.model.getId())) {
      this.getViewPreferences().subscribe(preferences =>
        this.setViewPreferences({
          ...preferences,
          activeView: view
        })
      );
    }
    this.columnConfigs$ = this.getColumnConfigs();
  }

  public onVisibleColumnsChange(columns: TableColumnConfig[]): void {
    this.globalCsvDownloadService.registerDataSource(`table-widget-renderer-${this.model.id}`, {
      type: GlobalCsvDownloadDataType.Table,
      columns: columns,
      data: this.model.getData()
    });
  }

  public onColumnsChange(columns: TableColumnConfig[]): void {
    if (isNonEmptyString(this.model.getId())) {
      this.getLocalPreferences().subscribe(preferences =>
        this.setLocalPreferences({
          ...preferences,
          columns: columns.map(column => this.dehydratePersistedColumnConfig(column))
        })
      );
    }
  }

  public onRowClicked(row: StatefulTableRow): void {
    this.getRowClickInteractionHandler(row)?.execute(row);
  }

  public onRowSelection(selections: StatefulTableRow[]): void {
    this.selectedRows = selections;
    /**
     * Todo: Stitch this with selection handlers
     */
  }

  private getRowClickInteractionHandler(selectedRow: StatefulTableRow): InteractionHandler | undefined {
    return this.getInteractionHandler(selectedRow, this.api.model.getRowClickHandlers());
  }

  private getInteractionHandler(
    row: StatefulTableRow,
    rowHandlers: TableWidgetRowInteractionModel[] = []
  ): InteractionHandler | undefined {
    const matchedHandlers = rowHandlers
      .filter(interactionModel => interactionModel.appliesToCurrentRowDepth(row.$$state.depth))
      .sort((model1, model2) => model2.rowDepth - model1.rowDepth);

    return !isEmpty(matchedHandlers) ? matchedHandlers[0].handler : undefined;
  }

  private hydratePersistedActiveView(
    viewItems: ToggleItem<string>[],
    persistedActiveView?: string
  ): ToggleItem<string> {
    return persistedActiveView !== undefined
      ? this.buildViewItem(persistedActiveView)
      : viewItems[TableWidgetRendererComponent.DEFAULT_TAB_INDEX];
  }

  private hydratePersistedColumnConfigs(
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

  private dehydratePersistedColumnConfig(column: TableColumnConfig): PersistedTableColumnConfig {
    /*
     * Note: The table columns have nested methods, so those are lost here when persistService uses JSON.stringify
     * to convert and store. We want to just pluck the relevant properties that are required to be saved.
     */
    return pick(column, ['id', 'visible']);
  }

  private getViewPreferences(): Observable<TableWidgetViewPreferences> {
    return isNonEmptyString(this.model.viewId)
      ? this.preferenceService.get<TableWidgetViewPreferences>(this.model.viewId, {}, StorageType.Local).pipe(first())
      : of({});
  }

  private setViewPreferences(preferences: TableWidgetViewPreferences): void {
    if (isNonEmptyString(this.model.viewId)) {
      this.preferenceService.set(this.model.viewId, preferences, StorageType.Local);
    }
  }

  private getLocalPreferences(): Observable<TableWidgetLocalPreferences> {
    return isNonEmptyString(this.model.getId())
      ? this.preferenceService
          .get<TableWidgetLocalPreferences>(this.model.getId()!, {}, StorageType.Local)
          .pipe(first())
      : of({});
  }

  private setLocalPreferences(preferences: TableWidgetLocalPreferences): void {
    if (isNonEmptyString(this.model.getId())) {
      this.preferenceService.set(this.model.getId()!, preferences, StorageType.Local);
    }
  }

  private getSessionPreferences(): Observable<TableWidgetSessionPreferences> {
    return isNonEmptyString(this.model.getId())
      ? this.preferenceService
          .get<TableWidgetSessionPreferences>(this.model.getId()!, {}, StorageType.InMemory)
          .pipe(first())
      : of({});
  }

  private setSessionPreferences(preferences: TableWidgetSessionPreferences): void {
    if (isNonEmptyString(this.model.getId())) {
      this.preferenceService.set(this.model.getId()!, preferences, StorageType.InMemory);
    }
  }

  private buildViewItem(viewOption: string): ToggleItem<string> {
    return {
      label: capitalize(viewOption),
      value: viewOption
    };
  }

  private mergeFilters(tableFilter: TableFilter): TableFilter[] {
    const existingSelectFiltersWithChangedRemoved = this.removeFilters(tableFilter.field);

    return [...existingSelectFiltersWithChangedRemoved, tableFilter];
  }

  private removeFilters(field: string): TableFilter[] {
    return this.selectFilterSubject.getValue().filter(existingFilter => existingFilter.field !== field);
  }

  private mergeQueryProperties(properties: Dictionary<unknown>): Dictionary<unknown> {
    return {
      ...this.queryPropertiesSubject.getValue(),
      ...properties
    };
  }
}

interface TableWidgetViewPreferences {
  activeView?: string;
}

interface TableWidgetLocalPreferences {
  columns?: PersistedTableColumnConfig[];
}

interface TableWidgetSessionPreferences {
  checkboxes?: TableCheckboxControl[];
  selections?: TableSelectControl[];
}

type PersistedTableColumnConfig = Pick<TableColumnConfig, 'id' | 'visible'>;
