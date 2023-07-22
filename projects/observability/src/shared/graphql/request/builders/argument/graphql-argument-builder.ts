import { GraphQlArgument, GraphQlArgumentObject, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { isEmpty, omit } from 'lodash-es';
import { AttributeExpression } from '../../../model/attribute/attribute-expression';
import { GraphQlFilter } from '../../../model/schema/filter/graphql-filter';
import { GraphQlSortBySpecification } from '../../../model/schema/sort/graphql-sort-by-specification';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { TraceType } from '../../../model/schema/trace';

export class GraphQlArgumentBuilder {
  public forOffset(offset?: number): GraphQlArgument[] {
    return offset === undefined ? [] : [{ name: 'offset', value: offset }];
  }

  public forAttributeKey(key: string): GraphQlArgument {
    return this.forAttributeExpression({ key: key });
  }

  public forAttributeExpression(attributeExpression: AttributeExpression): GraphQlArgument {
    return {
      name: 'expression',
      value: this.buildAttributeExpression(attributeExpression)
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
        value: orderBys.map(orderBy => this.buildOrderByArgumentValue(orderBy))
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

  public forScope(scope: string): GraphQlArgument {
    return { name: 'scope', value: scope };
  }

  protected buildAttributeExpression(
    attributeExpression: AttributeExpression
  ): AttributeExpression & GraphQlArgumentObject {
    return {
      key: attributeExpression.key,
      ...(!isEmpty(attributeExpression.subpath) ? { subpath: attributeExpression.subpath } : {})
    };
  }

  protected buildOrderByArgumentValue(orderBy: GraphQlSortBySpecification): GraphQlArgumentObject {
    const orderByFragment = orderBy.key.asGraphQlOrderByFragment();
    const unknownFields = omit(orderByFragment, 'direction', 'expression');

    return {
      ...unknownFields,
      direction: new GraphQlEnumArgument(orderBy.direction),
      keyExpression: this.buildAttributeExpression(orderByFragment.expression)
    };
  }
}
