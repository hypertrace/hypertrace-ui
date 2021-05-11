import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  assertUnreachable,
  Dictionary,
  forkJoinSafeEmpty,
  isEqualIgnoreFunctions,
  isNonEmptyString,
  PreferenceService
} from '@hypertrace/common';
import {
  FilterAttribute,
  FilterOperator,
  StatefulTableRow,
  TableCheckboxChange,
  TableCheckboxControl,
  TableColumnConfig,
  TableControlOption,
  TableControlOptionType,
  TableDataSource,
  TableFilter,
  TableFilterControlOption,
  TableRow,
  TableSelectChange,
  TableSelectControl,
  TableSelectionMode,
  TableStyle,
  ToggleItem,
  toInFilter
} from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { capitalize, isEmpty, pick } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, map, pairwise, share, startWith, switchMap, take, tap } from 'rxjs/operators';
import { AttributeMetadata, toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from '../../interaction/interaction-handler';
import { TableWidgetBaseModel } from './table-widget-base.model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
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
          [viewItems]="this.viewItems"
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
          [filters]="this.combinedFilters$ | async"
          [queryProperties]="this.queryProperties$ | async"
          [pageable]="this.api.model.isPageable()"
          [resizable]="this.api.model.isResizable()"
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
  public viewItems: ToggleItem<string>[] = [];

  public selectControls$!: Observable<TableSelectControl[]>;
  public checkboxControls$!: Observable<TableCheckboxControl[]>;

  public metadata$!: Observable<FilterAttribute[]>;
  public columnConfigs$!: Observable<TableColumnConfig[]>;
  public combinedFilters$!: Observable<TableFilter[]>;

  private readonly toggleFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  private readonly searchFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  private readonly selectFilterSubject: BehaviorSubject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);

  private readonly queryPropertiesSubject: BehaviorSubject<Dictionary<unknown>> = new BehaviorSubject<
    Dictionary<unknown>
  >({});
  public queryProperties$: Observable<Dictionary<unknown>> = this.queryPropertiesSubject.asObservable();

  private selectedRowInteractionHandler?: InteractionHandler;

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

    this.metadata$ = this.getScopeAttributes();
    this.columnConfigs$ = (isNonEmptyString(this.model.id)
      ? this.preferenceService.get<TableColumnConfig[]>(this.model.id, [])
      : of([])
    ).pipe(switchMap(persistedColumns => this.getColumnConfigs(persistedColumns)));

    this.combinedFilters$ = combineLatest([
      this.toggleFilterSubject,
      this.searchFilterSubject,
      this.selectFilterSubject
    ]).pipe(
      map(([toggleFilters, searchFilters, selectFilters]) => [...toggleFilters, ...searchFilters, ...selectFilters])
    );

    this.viewItems = this.model.getViewOptions().map(viewOption => ({
      label: capitalize(viewOption),
      value: viewOption
    }));
  }

  public getChildModel = (row: TableRow): object | undefined => this.model.getChildModel(row);

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
    this.selectControls$ = forkJoinSafeEmpty(
      this.model
        .getSelectControlOptions()
        .filter(checkboxControlModel => checkboxControlModel.visible)
        .map(selectControlModel =>
          // Fetch the values for the selectFilter dropdown
          selectControlModel.getOptions().pipe(
            take(1),
            map(options => ({
              placeholder: selectControlModel.placeholder,
              options: options
            }))
          )
        )
    );
  }

  protected fetchAndPopulateCheckboxControls(): void {
    this.checkboxControls$ = forkJoinSafeEmpty(
      this.model
        .getCheckboxControlOptions()
        .filter(checkboxControlModel => checkboxControlModel.visible)
        .map(checkboxControlModel =>
          checkboxControlModel.getOptions().pipe(
            take(1),
            map(options => ({
              label: checkboxControlModel.checked ? options[0].label : options[1].label,
              value: checkboxControlModel.checked,
              options: options
            }))
          )
        )
    ).pipe(
      tap((checkboxControls: TableCheckboxControl[]) => {
        // Apply initial values for checkboxes
        checkboxControls.forEach(checkboxControl => {
          this.onCheckboxChange({
            checkbox: checkboxControl,
            option: checkboxControl.value ? checkboxControl.options[0] : checkboxControl.options[1]
          });
        });
      })
    );
  }

  public get syncWithUrl(): boolean {
    return this.model.style === TableStyle.FullPage;
  }

  private getScope(): Observable<string | undefined> {
    return this.data$!.pipe(map(data => data?.getScope?.()));
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

  public onSelectChange(changed: TableSelectChange): void {
    if (changed.values.length === 0) {
      this.selectFilterSubject.next(this.removeFilters(changed.select.options[0].metaValue.field));

      return;
    }

    const tableFilters: TableFilter[] = changed.values.map((option: TableFilterControlOption) => option.metaValue);

    this.selectFilterSubject.next(this.mergeFilters(toInFilter(tableFilters)));
  }

  public onCheckboxChange(changed: TableCheckboxChange): void {
    switch (changed.option.type) {
      case TableControlOptionType.Property:
        this.queryPropertiesSubject.next(this.mergeQueryProperties(changed.option.metaValue));
        break;
      case TableControlOptionType.Filter:
        this.selectFilterSubject.next(this.mergeFilters(changed.option.metaValue));
        break;
      case TableControlOptionType.Unset:
        this.selectFilterSubject.next(this.removeFilters(changed.option.metaValue));
        break;
      default:
        assertUnreachable(changed.option);
    }

    // Update checkbox option label

    this.checkboxControls$ = forkJoinSafeEmpty(
      this.model.getCheckboxControlOptions().map(checkboxControlModel =>
        checkboxControlModel.getOptions().pipe(
          take(1),
          map(options => {
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
          })
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

  private getInteractionHandler(selectedRow: StatefulTableRow): InteractionHandler | undefined {
    const matchedSelectionHandlers = this.api.model
      .getRowSelectionHandlers(selectedRow)
      ?.filter(selectionModel => selectionModel.appliesToCurrentRowDepth(selectedRow.$$state.depth))
      .sort((model1, model2) => model2.rowDepth - model1.rowDepth);

    return !isEmpty(matchedSelectionHandlers) ? matchedSelectionHandlers[0].handler : undefined;
  }

  private pickPersistColumnProperties(column: TableColumnConfig): Pick<TableColumnConfig, 'id' | 'visible'> {
    /*
     * Note: The table columns have nested methods, so those are lost here when persistService uses JSON.stringify
     * to convert and store. We want to just pluck the relevant properties that are required to be saved.
     */
    return pick(column, ['id', 'visible']);
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
