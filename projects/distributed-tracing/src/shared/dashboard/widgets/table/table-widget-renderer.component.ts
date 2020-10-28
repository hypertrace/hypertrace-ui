import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { titleCase } from '@hypertrace/common';
import {
  FilterAttribute,
  TableColumnConfig,
  TableDataSource,
  TableMode,
  TableRow,
  TableStyle,
  ToggleItem
} from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { AttributeMetadata, toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';
import { GraphQlFieldFilter } from '../../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../../graphql/model/schema/filter/graphql-filter';
import { MetadataService } from '../../../services/metadata/metadata.service';
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
        [searchAttribute]="this.api.model.searchAttribute"
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
        [mode]="this.model.mode"
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

  public metadata$: Observable<FilterAttribute[]>;

  private readonly toggleFilterSubject: Subject<GraphQlFilter[]> = new BehaviorSubject<GraphQlFilter[]>([]);
  private readonly searchFilterSubject: Subject<GraphQlFilter[]> = new BehaviorSubject<GraphQlFilter[]>([]);

  public combinedFilters$: Observable<GraphQlFilter[]> = combineLatest([
    this.toggleFilterSubject,
    this.searchFilterSubject
  ]).pipe(map(([toggleFilters, searchFilters]) => [...toggleFilters, ...searchFilters]));

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TableWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly metadataService: MetadataService
  ) {
    super(api, changeDetector);

    this.metadata$ = this.getScopeAttributes();
    this.columnConfigs = this.getColumnConfigs();

    this.initControls();
  }

  private initControls(): void {
    this.filterItems = this.api.model.filterToggles.map(filter => ({
      label: filter.label,
      value: filter
    }));
    this.modeItems = this.api.model.modeToggles.map(mode => ({
      label: titleCase(mode),
      value: mode
    }));
  }

  public getChildModel = (row: TableRow): object | undefined => this.model.getChildModel(row);

  protected onDashboardRefresh(): void {
    this.initControls();
    super.onDashboardRefresh();
  }

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
    if (item.value && item.value.attribute && item.value.operator && item.value.value) {
      this.toggleFilterSubject.next([
        new GraphQlFieldFilter(item.value.attribute, item.value.operator, item.value.value)
      ]);

      return;
    }

    this.toggleFilterSubject.next([]);
  }

  public onSearchChange(text: string): void {
    const searchFilter = new GraphQlFieldFilter(this.api.model.searchAttribute!, GraphQlOperatorType.Like, text);
    this.searchFilterSubject.next([searchFilter]);
  }

  public onModeChange(mode: TableMode): void {
    this.model.mode = mode;
  }

  private getColumnConfigs(): TableColumnConfig[] {
    return this.model.getColumns();
  }

  public onRowSelection(selections: TableRow[]): void {
    this.api.model.selectionHandler?.execute(selections);
  }
}
