import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlFilter } from '../../../../../../shared/graphql/model/schema/filter/graphql-filter';
import { TraceType, TRACE_SCOPE } from '../../../../../../shared/graphql/model/schema/trace';
import {
  GraphQlTracesRequest,
  TracesResponse,
  TRACES_GQL_REQUEST
} from '../../../../../../shared/graphql/request/handlers/traces/traces-graphql-query-handler.service';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model'; // Todo: Fix this dependency
import { TableDataSourceModel } from '../table-data-source.model';

@Model({
  type: 'traces-table-data-source'
})
export class TracesTableDataSourceModel extends TableDataSourceModel {
  @ModelProperty({
    key: 'trace',
    type: STRING_PROPERTY.type
  })
  public traceType: TraceType = TRACE_SCOPE;

  public getScope(): string {
    return this.traceType;
  }

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): GraphQlTracesRequest {
    return {
      requestType: TRACES_GQL_REQUEST,
      traceType: this.traceType,
      properties: request.columns.map(column => column.specification),
      limit: request.position.limit * 2, // Prefetch 2 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [...filters, ...this.toGraphQlFilters(request.filters)],
      timeRange: this.getTimeRangeOrThrow()
    };
  }

  protected buildTableResponse(response: TracesResponse): TableDataResponse<TableRow> {
    return {
      data: response.results,
      totalCount: response.total
    };
  }
}
