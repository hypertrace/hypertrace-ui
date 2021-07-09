import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { TimeDurationModel } from '@hypertrace/dashboards';
import {
  GraphQlFilter,
  SpecificationBackedTableColumnDef,
  TableDataSourceModel
} from '@hypertrace/distributed-tracing';
import {
  ARRAY_PROPERTY,
  BOOLEAN_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ExploreSpecification } from './../../../../../graphql/model/schema/specifications/explore-specification';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResponse
} from './../../../../../graphql/request/handlers/explore/explore-query';

@Model({
  type: 'explore-table-data-source'
})
export class ExploreTableDataSourceModel extends TableDataSourceModel {
  @ModelProperty({
    key: 'context',
    required: true,
    type: STRING_PROPERTY.type
  })
  public context!: string;

  @ModelProperty({
    key: 'interval',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TimeDurationModel
    } as ModelModelPropertyTypeInstance
  })
  public interval?: TimeDurationModel;

  @ModelProperty({
    key: 'group-by',
    required: false,
    type: ARRAY_PROPERTY.type
  })
  public groupBy: string[] = [];

  @ModelProperty({
    key: 'group-by-include-rest',
    required: false,
    type: BOOLEAN_PROPERTY.type
  })
  public groupByIncludeRest: boolean = true;

  @ModelProperty({
    key: 'group-limit',
    required: false,
    type: NUMBER_PROPERTY.type
  })
  public groupLimit: number = 100;

  public getScope(): string {
    return this.context;
  }

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef<ExploreSpecification>>
  ): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      context: this.context,
      selections: request.columns.map(column => column.specification),
      interval: this.interval?.getDuration(),
      limit: request.position.limit * 2, // Prefetch 2 pages
      offset: request.position.startIndex,
      orderBy: request.sort && [
        {
          direction: request.sort.direction,
          key: request.sort.column.specification
        }
      ],
      filters: [...filters, ...this.toGraphQlFilters(request.filters)],
      timeRange: this.getTimeRangeOrThrow(),
      groupBy: {
        keys: this.groupBy,
        includeRest: this.groupByIncludeRest,
        limit: this.groupLimit
      }
    };
  }

  protected buildTableResponse(response: GraphQlExploreResponse): TableDataResponse<TableRow> {
    return {
      data: response.results,
      totalCount: response.total ?? response.results.length
    };
  }
}
