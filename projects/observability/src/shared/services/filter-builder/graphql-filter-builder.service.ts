import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { FieldFilter, FilterOperator, FilterValue, TableFilter } from '@hypertrace/components';
import { GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { GraphQlFieldFilter } from '../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../graphql/model/schema/filter/graphql-filter';

@Injectable({ providedIn: 'root' })
export class GraphQlFilterBuilderService {
  /**
   * This is a temporary method to convert the GraphQL Field filters to its UI counterpart Filter Field Object.
   */
  public buildFiltersFromGraphQlFieldFilters(filters: GraphQlFieldFilter[]): FieldFilter[] {
    return filters.map(filter => ({
      field: typeof filter.keyOrExpression === 'string' ? filter.keyOrExpression : filter.keyOrExpression.key,
      subpath: typeof filter.keyOrExpression === 'string' ? undefined : filter.keyOrExpression.subpath,
      operator: toFilterOperator(filter.operator),
      value: filter.value as FilterValue,
      urlString: ''
    }));
  }

  public buildGraphQlFieldFilters(filters: FieldFilter[]): GraphQlFieldFilter[] {
    return filters.map(
      filter =>
        new GraphQlFieldFilter(
          { key: filter.field, subpath: filter.subpath },
          toGraphQlOperator(filter.operator!), // Todo : Very weird
          filter.value as GraphQlArgumentValue
        )
    );
  }

  public buildGraphQlFiltersFromTableFilters(filters: TableFilter[]): GraphQlFilter[] {
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

export const toFilterOperator = (operator: GraphQlOperatorType): FilterOperator => {
  switch (operator) {
    case GraphQlOperatorType.Equals:
      return FilterOperator.Equals;

    case GraphQlOperatorType.NotEquals:
      return FilterOperator.NotEquals;

    case GraphQlOperatorType.LessThan:
      return FilterOperator.LessThan;

    case GraphQlOperatorType.LessThanOrEqualTo:
      return FilterOperator.LessThanOrEqualTo;

    case GraphQlOperatorType.GreaterThan:
      return FilterOperator.GreaterThan;

    case GraphQlOperatorType.GreaterThanOrEqualTo:
      return FilterOperator.GreaterThanOrEqualTo;

    case GraphQlOperatorType.Like:
      return FilterOperator.Like;

    case GraphQlOperatorType.In:
      return FilterOperator.In;

    case GraphQlOperatorType.NotIn:
      throw new Error('NotIn operator is not supported');

    case GraphQlOperatorType.ContainsKey:
      return FilterOperator.ContainsKey;
    default:
      return assertUnreachable(operator);
  }
};
