import { PaginatorTotalCode, TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { BOOLEAN_PROPERTY, Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlFilter } from '../../../../../../shared/graphql/model/schema/filter/graphql-filter';
import { TRACE_SCOPE, TraceType } from '../../../../../../shared/graphql/model/schema/trace';
import {
  GraphQlTracesRequest,
  TRACES_GQL_REQUEST,
  TracesResponse
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

  @ModelProperty({
    key: 'ignoreTotal',
    type: BOOLEAN_PROPERTY.type
  })
  public ignoreTotal: boolean = false;

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
      properties: request.columns.filter(column => column.visible).map(column => column.specification),
      limit: request.position.limit, // Prefetch 2 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [...filters, ...this.toGraphQlFilters(request.filters)],
      timeRange: this.getTimeRangeOrThrow(),
      ignoreTotal: this.ignoreTotal
    };
  }

  protected buildTableResponse(
    response: TracesResponse,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): TableDataResponse<TableRow> {
    return {
      data: response.results,
      // We want to avoid showing real totals for traces table.
      // Provide the `last` code when results are lesser than the limit (aka, we know there are no more results)
      // Provide the `unknown` code otherwise
      totalCount: this.ignoreTotal
        ? response.results.length < request.position.limit
          ? PaginatorTotalCode.Last
          : PaginatorTotalCode.Unknown
        : response.total
    };
  }
}
