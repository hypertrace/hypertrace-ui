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
import { RENDERER_API, RendererApi } from '@hypertrace/hyperdash-angular';
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
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from '../../interaction/interaction-handler';
import { TableWidgetRowInteractionModel } from './selections/table-widget-row-interaction.model';
import { TableWidgetBaseModel } from './table-widget-base.model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetViewToggleModel } from './table-widget-view-toggle.model';
import { TableWidgetModel } from './table-widget.model';

// tslint:disable: max-file-line-count
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
          [loadingConfig]="this.model.loadingConfig"
          [filters]="this.combinedFilters$ | async"
          [queryProperties]="this.queryProperties$ | async"
          [pageable]="this.api.model.isPageable()"
          [resizable]="this.api.model.isResizable()"
          [detailContent]="childDetail"
          [syncWithUrl]="this.syncWithUrl"
          (rowClicked)="this.onRowClicked($event)"
          (selectionsChange)="this.onRowSelection($event)"
          (columnConfigsChange)="this.onColumnsChange($event)"
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
  private static readonly DEFAULT_PREFERENCES: TableWidgetPreferences = {
    columns: [],
    checkboxes: []
  };

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
    private readonly preferenceService: PreferenceService
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
        selectControls.forEach(selectControl =>
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
    return this.getPreferences().pipe(
      take(1),
      switchMap(preferences =>
        forkJoinSafeEmpty(
          this.model
            .getSelectControlOptions()
            .filter(selectControlModel => selectControlModel.visible)
            .map(selectControlModel => {
              if (selectControlModel.placeholder === changed?.placeholder) {
                return of(changed);
              }

              // Fetch the values for the selectFilter dropdown
              return selectControlModel.getOptions().pipe(
                take(1),
                withLatestFrom(this.selectFilterSubject),
                map(([options, filters]) => {
                  const foundPreferences = preferences.selections
                    ? preferences.selections.find(
                        preferencesSelectionControl =>
                          selectControlModel.placeholder === preferencesSelectionControl.placeholder
                      )
                    : undefined;

                  return (
                    foundPreferences ?? {
                      placeholder: selectControlModel.placeholder,
                      options: options.map(option => ({
                        ...option,
                        applied: this.isFilterApplied(option.metaValue, filters)
                      }))
                    }
                  );
                })
              );
            })
        )
      )
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
    return this.getPreferences().pipe(
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
      this.getPreferences().subscribe(preferences =>
        this.setPreferences({
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
      this.getPreferences().subscribe(preferences =>
        this.setPreferences({
          ...preferences,
          checkboxes: tableCheckboxControls
        })
      );
    }
  }

  private getCheckboxControls(changed?: TableCheckboxChange): Observable<TableCheckboxControl[]> {
    return this.getPreferences().pipe(
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
    const searchFilter: TableFilter = {
      field: this.api.model.getSearchAttribute()!,
      operator: FilterOperator.Like,
      value: text
    };
    this.searchFilterSubject.next([searchFilter]);
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

  public onColumnsChange(columns: TableColumnConfig[]): void {
    if (isNonEmptyString(this.model.getId())) {
      this.getPreferences().subscribe(preferences =>
        this.setPreferences({
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
     * Todo: Stich this with selection handlers
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
      ? this.preferenceService.get<TableWidgetViewPreferences>(this.model.viewId, {}, StorageType.Session).pipe(first())
      : of({});
  }

  private setViewPreferences(preferences: TableWidgetViewPreferences): void {
    if (isNonEmptyString(this.model.viewId)) {
      this.preferenceService.set(this.model.viewId, preferences, StorageType.Session);
    }
  }

  private getPreferences(
    defaultPreferences: TableWidgetPreferences = TableWidgetRendererComponent.DEFAULT_PREFERENCES
  ): Observable<TableWidgetPreferences> {
    return isNonEmptyString(this.model.getId())
      ? this.preferenceService.get<TableWidgetPreferences>(this.model.getId()!, defaultPreferences, StorageType.Session).pipe(first())
      : of(defaultPreferences);
  }

  private setPreferences(preferences: TableWidgetPreferences): void {
    if (isNonEmptyString(this.model.getId())) {
      this.preferenceService.set(this.model.getId()!, preferences, StorageType.Session);
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

    return [...existingSelectFiltersWithChangedRemoved, tableFilter].filter(f => f.value !== undefined); // Remove filters that are unset
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

interface TableWidgetPreferences {
  columns?: PersistedTableColumnConfig[];
  checkboxes?: TableCheckboxControl[];
  selections?: TableSelectControl[];
}

type PersistedTableColumnConfig = Pick<TableColumnConfig, 'id' | 'visible'>;
