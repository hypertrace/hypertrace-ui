import { TableDataSource, TableMode, TableRow } from '@hypertrace/components';
import { ArrayPropertyTypeInstance, ENUM_TYPE, ModelTemplatePropertyType } from '@hypertrace/dashboards';
import { ARRAY_PROPERTY, Model, ModelApi, ModelJson, ModelProperty } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { TableWidgetBaseModel } from './table-widget-base.model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetModel } from './table-widget.model';

@Model({
  type: 'mode-toggle-table-widget',
  displayName: 'Mode Toggle Table Widget'
})
export class ModeToggleTableWidgetModel extends TableWidgetBaseModel {
  @ModelProperty({
    key: 'modeOptions',
    displayName: 'Modes Toggle Options',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ENUM_TYPE.type,
        values: [TableMode.Flat, TableMode.Tree, TableMode.Detail]
      }
    } as ArrayPropertyTypeInstance
  })
  public modeOptions: TableMode[] = [];

  @ModelProperty({
    key: 'flat',
    type: ModelTemplatePropertyType.TYPE
  })
  public flat!: ModelJson;

  @ModelProperty({
    key: 'tree',
    type: ModelTemplatePropertyType.TYPE
  })
  public tree!: ModelJson;

  @ModelProperty({
    key: 'detail',
    type: ModelTemplatePropertyType.TYPE
  })
  public detail!: ModelJson;

  @ModelInject(MODEL_API)
  protected readonly api!: ModelApi;

  private delegateModel?: TableWidgetModel;

  public setMode(mode: TableMode): void {
    if (this.delegateModel) {
      this.api.destroyChild(this.delegateModel);
    }
    this.delegateModel = this.createDelegate(mode);
  }

  public getModeOptions(): TableMode[] {
    return this.modeOptions;
  }

  private createDelegate(mode: TableMode): TableWidgetModel | undefined {
    switch (mode) {
      case TableMode.Detail:
        return this.api.createChild<TableWidgetModel>(this.detail);
      case TableMode.Tree:
        return this.api.createChild<TableWidgetModel>(this.tree);
      case TableMode.Flat:
        return this.api.createChild<TableWidgetModel>(this.flat);
      default:
        return undefined;
    }
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
}
