import { assertUnreachable } from '@hypertrace/common';
import { TableDataRequest, TableDataResponse, TableMode, TableRow } from '@hypertrace/components';
import { ModelTemplatePropertyType } from '@hypertrace/dashboards';
import { Model, ModelJson, ModelProperty } from '@hypertrace/hyperdash';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model';
import { TableDataSourceModel } from '../table-data-source.model';

@Model({
  type: 'mode-entity-table-data-source'
})
export class ModeEntityTableDataSourceModel extends TableDataSourceModel {
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

  private getChildModel(mode: TableMode): TableDataSourceModel {
    switch (mode) {
      case TableMode.Flat:
        return this.api.createChild<TableDataSourceModel>(this.flat);
      case TableMode.Tree:
        return this.api.createChild<TableDataSourceModel>(this.tree);
      case TableMode.Detail:
        return this.api.createChild<TableDataSourceModel>(this.detail);
      default:
        return assertUnreachable(mode);
    }
  }

  public buildGraphQlRequest(
    inheritedFilters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
    mode: TableMode
  ): unknown {
    return this.getChildModel(mode).buildGraphQlRequest(inheritedFilters, request);
  }

  public buildTableResponse(
    response: unknown,
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
    mode: TableMode
  ): TableDataResponse<TableRow> {
    return this.getChildModel(mode).buildTableResponse(response, request);
  }

  public getScope(mode: TableMode): string | undefined {
    return this.getChildModel(mode).getScope();
  }
}
