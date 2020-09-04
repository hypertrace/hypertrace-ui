import { GraphQlArgument, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlFilter } from '../../../model/schema/filter/graphql-filter';
import { GraphQlSortBySpecification } from '../../../model/schema/sort/graphql-sort-by-specification';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { TraceType } from '../../../model/schema/trace';

export class GraphQlArgumentBuilder {
  public forOffset(offset?: number): GraphQlArgument[] {
    return offset === undefined ? [] : [{ name: 'offset', value: offset }];
  }

  public forAttributeKey(key: string): GraphQlArgument {
    return {
      name: 'key',
      value: key
    };
  }

  public forLimit(limit: number): GraphQlArgument {
    return { name: 'limit', value: limit };
  }

  public forOrderBy(orderBy?: GraphQlSortBySpecification): GraphQlArgument[] {
    return this.forOrderBys(orderBy && [orderBy]);
  }

  public forOrderBys(orderBys: GraphQlSortBySpecification[] = []): GraphQlArgument[] {
    if (orderBys.length === 0) {
      return [];
    }

    return [
      {
        name: 'orderBy',
        value: orderBys.map(orderBy => ({
          ...orderBy.key.asGraphQlOrderByFragment(),
          direction: new GraphQlEnumArgument(orderBy.direction)
        }))
      }
    ];
  }

  public forTimeRange(timeRange: GraphQlTimeRange): GraphQlArgument {
    return {
      name: 'between',
      value: timeRange.asArgumentObject()
    };
  }

  public forFilters(filters: GraphQlFilter[] = []): GraphQlArgument[] {
    if (filters.length === 0) {
      return [];
    }

    return [
      {
        name: 'filterBy',
        value: filters.flatMap(filter => filter.asArgumentObjects())
      }
    ];
  }

  public forId(id: string): GraphQlArgument {
    return {
      name: 'id',
      value: id
    };
  }

  public forTraceType(type: TraceType): GraphQlArgument {
    return {
      name: 'type',
      value: new GraphQlEnumArgument(type)
    };
  }
}
