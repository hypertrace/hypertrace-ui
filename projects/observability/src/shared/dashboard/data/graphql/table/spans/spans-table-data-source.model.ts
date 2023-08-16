import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';

import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { SPAN_SCOPE } from '../../../../../graphql/model/schema/span';
import {
  GraphQlSpansRequest,
  SPANS_GQL_REQUEST,
  SpansResponse
} from '../../../../../graphql/request/handlers/spans/spans-graphql-query-handler.service';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model'; // Todo: Fix this dependency
import { TableDataSourceModel } from '../table-data-source.model';

@Model({
  type: 'spans-table-data-source'
})
export class SpansTableDataSourceModel extends TableDataSourceModel {
  // Mandatory fields: added to the request even if they are not visible
  private mandatoryColumns: string[] = ['traceId'];

  public getScope(): string {
    return SPAN_SCOPE;
  }

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): GraphQlSpansRequest {
    return {
      requestType: SPANS_GQL_REQUEST,
      properties: request.columns
        .filter(column => column.visible || this.mandatoryColumns.includes(column.id))
        .map(column => column.specification),
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

  protected buildTableResponse(response: SpansResponse): TableDataResponse<TableRow> {
    return {
      data: response.results,
      totalCount: response.total
    };
  }
}
