import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { SPAN_SCOPE } from '../../../../../graphql/model/schema/span';
import {
  GraphQlSpansRequest,
  SpansResponse,
  SPANS_GQL_REQUEST
} from '../../../../../graphql/request/handlers/spans/spans-graphql-query-handler.service';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model'; // Todo: Fix this dependency
import { TableDataSourceModel } from '../table-data-source.model';

@Model({
  type: 'spans-table-data-source'
})
export class SpansTableDataSourceModel extends TableDataSourceModel {
  public getScope(): string {
    return SPAN_SCOPE;
  }

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): GraphQlSpansRequest {
    return {
      requestType: SPANS_GQL_REQUEST,
      properties: request.columns.map(column => column.specification),
      limit: request.position.limit * 10, // Prefetch 10 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [...filters, ...this.buildSearchFilters(request)],
      timeRange: this.getTimeRangeOrThrow()
    };
  }

  protected buildTableResponse(response: SpansResponse): TableDataResponse<TableRow> {
    return {
      data: response.results,
      totalCount: response.total
    };
  }
  protected getSearchFilterAttribute(): string {
    // Todo: Figure this out
    return '';
  }
}
