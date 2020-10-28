import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  FilterAttribute,
  StatefulTableRow,
  TableColumnConfig,
  TableDataSource,
  TableRow,
  TableSelectionMode,
  TableStyle
} from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { isEmpty } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { AttributeMetadata, toFilterAttributeType } from '../../../graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from './../../interaction/interaction-handler';
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
      <ht-table
        class="table"
        [ngClass]="{ 'header-margin': this.model.header?.topMargin }"
        [columnConfigs]="this.columnConfigs"
        [metadata]="this.metadata$ | async"
        [mode]="this.model.mode"
        [selectionMode]="this.model.selectionMode"
        [display]="this.model.style"
        [data]="this.data$ | async"
        [searchable]="this.api.model.searchable"
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
  public metadata$: Observable<FilterAttribute[]>;
  public columnConfigs: TableColumnConfig[];
  private selectedRowInteractionHandler?: InteractionHandler;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TableWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly metadataService: MetadataService
  ) {
    super(api, changeDetector);

    this.metadata$ = this.getScopeAttributes();
    this.columnConfigs = this.getColumnConfigs();
  }

  public getChildModel = (row: TableRow): object | undefined => this.model.getChildModel(row);

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

  public get syncWithUrl(): boolean {
    return this.model.style === TableStyle.FullPage;
  }

  protected fetchData(): Observable<TableDataSource<TableRow> | undefined> {
    return this.model.getData().pipe(startWith(undefined));
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

  private getColumnConfigs(): TableColumnConfig[] {
    return this.model.getColumns();
  }

  private getInteractionHandler(selectedRow: StatefulTableRow): InteractionHandler | undefined {
    const matchedSelectionHandlers = this.api.model.rowSelectionHandlers
      ?.filter(selectionModel => selectionModel.appliesToCurrentRowDepth(selectedRow.$$state.depth))
      .sort((model1, model2) => model2.rowDepth - model1.rowDepth);

    return !isEmpty(matchedSelectionHandlers) ? matchedSelectionHandlers![0].handler : undefined;
  }
}
