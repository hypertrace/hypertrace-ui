import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { Filter, FilterAttributeType, FilterOperator } from '@hypertrace/components';
import { GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { GraphQlFieldFilter } from '../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../graphql/model/schema/filter/graphql-filter';

@Injectable({ providedIn: 'root' })
export class GraphQlFilterBuilderService {
  public buildGraphQlFilters(filters: Filter[]): GraphQlFilter[] {
    return filters.map(
      filter =>
        new GraphQlFieldFilter(
          filter.field,
          toGraphQlOperator(filter.operator),
          toGraphQlArgumentValue(filter.metadata.type, filter.value)
        )
    );
  }
}

export const toGraphQlOperator = (operator: FilterOperator): GraphQlOperatorType => {
  switch (operator) {
    case FilterOperator.Equals:
      return GraphQlOperatorType.Equals;
    case FilterOperator.NotEquals:
      return GraphQlOperatorType.NotEquals;
    case FilterOperator.LessThan:
      return GraphQlOperatorType.LessThan;
    case FilterOperator.LessThanOrEqualTo:
      return GraphQlOperatorType.LessThanOrEqualTo;
    case FilterOperator.GreaterThan:
      return GraphQlOperatorType.GreaterThan;
    case FilterOperator.GreaterThanOrEqualTo:
      return GraphQlOperatorType.GreaterThanOrEqualTo;
    case FilterOperator.Like:
      return GraphQlOperatorType.Like;
    case FilterOperator.In:
      return GraphQlOperatorType.In;
    case FilterOperator.ContainsKey:
      return GraphQlOperatorType.ContainsKey;
    case FilterOperator.ContainsKeyValue:
      return GraphQlOperatorType.ContainsKeyValue;
    default:
      return assertUnreachable(operator);
  }
};

export const toGraphQlArgumentValue = (type: FilterAttributeType, value: unknown): GraphQlArgumentValue => {
  switch (type) {
    case FilterAttributeType.Boolean:
    case FilterAttributeType.Number:
    case FilterAttributeType.String:
    case FilterAttributeType.StringArray:
    case FilterAttributeType.StringMap:
    case FilterAttributeType.Timestamp:
      return value as GraphQlArgumentValue;
    default:
      return assertUnreachable(type);
  }
};
