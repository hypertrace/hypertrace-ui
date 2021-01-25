import { TableDataSource, TableRow } from '@hypertrace/components';
import { ArrayPropertyTypeInstance } from '@hypertrace/dashboards';
import { ARRAY_PROPERTY, Model, ModelApi, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { TableWidgetRowSelectionModel } from './selections/table-widget-row-selection.model';
import { TableWidgetBaseModel } from './table-widget-base.model';
import { TableWidgetCheckboxFilterModel } from './table-widget-checkbox-filter-model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetSelectFilterModel } from './table-widget-select-filter.model';
import { TableWidgetViewModel } from './table-widget-view.model';
import { TableWidgetModel } from './table-widget.model';

@Model({
  type: 'table-widget-view-toggle'
})
export class TableWidgetViewToggleModel extends TableWidgetBaseModel {
  @ModelProperty({
    key: 'views',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetViewModel
      }
    } as ArrayPropertyTypeInstance
  })
  public views: TableWidgetViewModel[] = [];

  @ModelInject(MODEL_API)
  protected readonly api!: ModelApi;

  private delegateModel?: TableWidgetModel;

  public setView(view: string): void {
    if (this.delegateModel) {
      this.api.destroyChild(this.delegateModel);
    }
    this.delegateModel = this.createDelegate(view);
  }

  public getViewOptions(): string[] {
    return this.views.map(v => v.label);
  }

  private createDelegate(view: string): TableWidgetModel | undefined {
    const found = this.views.find(v => v.label.toLowerCase() === view.toLowerCase());

    return found ? this.api.createChild<TableWidgetModel>(found.template) : undefined;
  }

  public getData(): Observable<TableDataSource<TableRow>> {
    return this.delegateModel ? this.delegateModel?.getData() : NEVER;
  }

  public getColumns(scope?: string): Observable<SpecificationBackedTableColumnDef[]> {
    return this.delegateModel ? this.delegateModel?.getColumns(scope) : NEVER;
  }

  public getChildModel(row: TableRow): object | undefined {
    return this.delegateModel && this.delegateModel?.getChildModel(row);
  }

  public getRowSelectionHandlers(row: TableRow): TableWidgetRowSelectionModel[] {
    return this.delegateModel && this.delegateModel?.getRowSelectionHandlers(row).length > 0
      ? this.delegateModel?.getRowSelectionHandlers(row)
      : [];
  }

  public getSearchAttribute(): string | undefined {
    return this.delegateModel?.getSearchAttribute() ?? this.searchAttribute;
  }

  public getCheckboxFilterOption(): TableWidgetCheckboxFilterModel | undefined {
    return this.delegateModel?.getCheckboxFilterOption() ?? this.checkboxFilterOption;
  }

  public getSelectFilterOptions(): TableWidgetSelectFilterModel[] {
    return this.delegateModel?.getSelectFilterOptions() ?? this.selectFilterOptions;
  }
}
