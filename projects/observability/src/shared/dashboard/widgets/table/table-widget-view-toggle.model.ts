import { TableDataSource, TableRow } from '@hypertrace/components';
import { ArrayPropertyTypeInstance } from '@hypertrace/dashboards';
import { ARRAY_PROPERTY, Model, ModelApi, ModelOnInit, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { TableWidgetRowSelectionModel } from './selections/table-widget-row-selection.model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetControlCheckboxOptionModel } from './table-widget-control-checkbox-option.model';
import { TableWidgetControlSelectOptionModel } from './table-widget-control-select-option.model';
import { TableWidgetViewModel } from './table-widget-view.model';
import { TableWidgetModel } from './table-widget.model';

@Model({
  type: 'table-widget-view-toggle'
})
export class TableWidgetViewToggleModel extends TableWidgetModel implements ModelOnInit {
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
  private currentView?: string;

  public modelOnInit(): void {
    if (this.views.length > 0) {
      this.setView(this.views[0].label);
    }
  }

  public setView(view: string): void {
    if (this.currentView === view) {
      return;
    }
    this.currentView = view;

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

  public getCustomControlWidgetModel(selectedRows?: TableRow[]): object | undefined {
    return this.delegateModel && this.delegateModel?.getCustomControlWidgetModel(selectedRows);
  }

  public getRowSelectionHandlers(row: TableRow): TableWidgetRowSelectionModel[] {
    return this.delegateModel && this.delegateModel?.getRowSelectionHandlers(row).length > 0
      ? this.delegateModel?.getRowSelectionHandlers(row)
      : [];
  }

  public getSearchAttribute(): string | undefined {
    return this.delegateModel?.getSearchAttribute() ?? this.searchAttribute;
  }

  public getSearchPlaceholder(): string | undefined {
    return this.delegateModel?.getSearchPlaceholder() ?? this.searchPlaceholder;
  }

  public getCheckboxControlOptions(): TableWidgetControlCheckboxOptionModel[] {
    return this.delegateModel?.getCheckboxControlOptions() ?? this.checkboxOptions;
  }

  public setCheckboxControlOptions(checkboxOptions: TableWidgetControlCheckboxOptionModel[]): void {
    this.delegateModel?.setCheckboxControlOptions(checkboxOptions);
  }

  public getSelectControlOptions(): TableWidgetControlSelectOptionModel[] {
    return this.delegateModel?.getSelectControlOptions() ?? this.selectOptions;
  }
}
