import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { FilterOperator, TableFilter } from '@hypertrace/components';
import { GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { GraphQlFieldFilter } from '../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../graphql/model/schema/filter/graphql-filter';

@Injectable({ providedIn: 'root' })
export class GraphQlFilterBuilderService {
  public buildGraphQlFilters(filters: TableFilter[]): GraphQlFilter[] {
    return filters.map(
      filter =>
        new GraphQlFieldFilter(
          { key: filter.field, subpath: filter.subpath },
          toGraphQlOperator(filter.operator),
          filter.value as GraphQlArgumentValue
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
    default:
      return assertUnreachable(operator);
  }
};
