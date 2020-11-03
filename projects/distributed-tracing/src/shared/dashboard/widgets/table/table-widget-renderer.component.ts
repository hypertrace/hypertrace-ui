import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import { capitalize, isEmpty } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { AttributeMetadata, toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from '../../interaction/interaction-handler';
import { TableWidgetFilterModel } from './table-widget-filter-model';
import { TableWidgetModel } from './table-widget.model';

@Renderer({ modelClass: TableWidgetModel })
@Component({
  selector: 'ht-table-widget-renderer',
  styleUrls: ['./table-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content
      [title]="this.model.header?.title | htDisplayTitle"
      [link]="this.model.header?.link?.url"
      [linkLabel]="this.model.header?.link?.displayText"
      class="table-widget-container"
    >
      <ht-table-controls
        class="table-controls"
        [searchEnabled]="!!this.api.model.searchAttribute"
        [filterItems]="this.filterItems"
        [modeItems]="this.modeItems"
        (searchChange)="this.onSearchChange($event)"
        (filterChange)="this.onFilterChange($event)"
        (modeChange)="this.onModeChange($event)"
      >
      </ht-table-controls>

      <ht-table
        class="table"
        [ngClass]="{ 'header-margin': this.model.header?.topMargin }"
        [columnConfigs]="this.columnConfigs"
        [metadata]="this.metadata$ | async"
        [mode]="this.activeMode"
        [selectionMode]="this.model.selectionMode"
        [display]="this.model.style"
        [data]="this.data$ | async"
        [filters]="this.combinedFilters$ | async"
        [pageable]="this.api.model.pageable"
        [detailContent]="childDetail"
        [syncWithUrl]="this.syncWithUrl"
        (selectionsChange)="this.onRowSelection($event)"
      >
      </ht-table>
    </ht-titled-content>
    <ng-template #childDetail let-row="row">
      <ng-container [hdaDashboardModel]="this.getChildModel | htMemoize: row"></ng-container>
    </ng-template>
  `
})
export class TableWidgetRendererComponent
  extends WidgetRenderer<TableWidgetModel, TableDataSource<TableRow> | undefined>
  implements OnInit {
  public columnConfigs: TableColumnConfig[];
  public filterItems: ToggleItem<TableWidgetFilterModel>[] = [];
  public modeItems: ToggleItem<TableMode>[] = [];
  public activeMode: TableMode;

  public metadata$: Observable<FilterAttribute[]>;

  private readonly toggleFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);
  private readonly searchFilterSubject: Subject<TableFilter[]> = new BehaviorSubject<TableFilter[]>([]);

  public combinedFilters$: Observable<TableFilter[]> = combineLatest([
    this.toggleFilterSubject,
    this.searchFilterSubject
  ]).pipe(map(([toggleFilters, searchFilters]) => [...toggleFilters, ...searchFilters]));

  private selectedRowInteractionHandler?: InteractionHandler;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TableWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly metadataService: MetadataService
  ) {
    super(api, changeDetector);

    this.metadata$ = this.getScopeAttributes();
    this.columnConfigs = this.getColumnConfigs();

    this.filterItems = this.api.model.filterOptions.map(filter => ({
      label: capitalize(filter.label),
      value: filter
    }));
    this.modeItems = this.api.model.modeOptions.map(mode => ({
      label: capitalize(mode),
      value: mode
    }));
    this.activeMode = this.api.model.mode;
  }

  public getChildModel = (row: TableRow): object | undefined => this.model.getChildModel(row);

  protected fetchData(): Observable<TableDataSource<TableRow> | undefined> {
    return this.model.getData().pipe(startWith(undefined));
  }

  public get syncWithUrl(): boolean {
    return this.model.style === TableStyle.FullPage;
  }

  private getScope(): Observable<string | undefined> {
    return this.api.model.getData().pipe(map(data => data.getScope()));
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
    this.columnConfigs = this.getColumnConfigs();
  }

  private getColumnConfigs(): TableColumnConfig[] {
    return this.model.getColumns(this.activeMode);
  }

  public onRowSelection(selections: StatefulTableRow[]): void {
    if (this.api.model.selectionMode === TableSelectionMode.Single) {
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
    const matchedSelectionHandlers = this.api.model.rowSelectionHandlers
      ?.filter(selectionModel => selectionModel.appliesToCurrentRowDepth(selectedRow.$$state.depth))
      .sort((model1, model2) => model2.rowDepth - model1.rowDepth);

    return !isEmpty(matchedSelectionHandlers) ? matchedSelectionHandlers![0].handler : undefined;
  }
}
