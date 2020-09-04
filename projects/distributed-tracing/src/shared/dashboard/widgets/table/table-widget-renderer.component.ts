import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FilterAttribute, TableColumnConfig, TableDataSource, TableRow, TableStyle } from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { AttributeMetadata, toFilterType } from '../../../graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { TableWidgetModel } from './table-widget.model';

@Renderer({ modelClass: TableWidgetModel })
@Component({
  selector: 'htc-table-widget-renderer',
  styleUrls: ['./table-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-titled-content
      [title]="this.model.header?.title | htcDisplayTitle"
      [link]="this.model.header?.link?.url"
      [linkLabel]="this.model.header?.link?.displayText"
      class="table-widget-container"
    >
      <htc-table
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
      </htc-table>
    </htc-titled-content>
    <ng-template #childDetail let-row="row">
      <ng-container [hdaDashboardModel]="this.getChildModel | htcMemoize: row"></ng-container>
    </ng-template>
  `
})
export class TableWidgetRendererComponent
  extends WidgetRenderer<TableWidgetModel, TableDataSource<TableRow> | undefined>
  implements OnInit {
  public metadata$: Observable<FilterAttribute[]>;
  public columnConfigs: TableColumnConfig[];

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
          type: toFilterType(attribute.type)
        }))
      )
    );
  }

  private getColumnConfigs(): TableColumnConfig[] {
    return this.model.getColumns();
  }

  public onRowSelection(selections: TableRow[]): void {
    this.api.model.selectionHandler?.execute(selections);
  }
}
