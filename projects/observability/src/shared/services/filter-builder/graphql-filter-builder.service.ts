import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { FieldFilter, Filter, FilterOperator, FilterValue, TableFilter } from '@hypertrace/components';
import { GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { escapeRegExp } from 'lodash-es';
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
      urlString: '',
    }));
  }

  public buildGraphQlFieldFilters(filters: (Filter | FieldFilter)[]): GraphQlFieldFilter[] {
    return filters.map(
      filter =>
        new GraphQlFieldFilter(
          { key: filter.field, subpath: filter.subpath },
          toGraphQlOperator(filter.operator!), // Todo : Very weird
          this.extractGraphQlFilterValue(filter),
        ),
    );
  }

  public buildGraphQlFiltersFromTableFilters(filters: TableFilter[]): GraphQlFilter[] {
    return filters.map(
      filter =>
        new GraphQlFieldFilter(
          { key: filter.field, subpath: filter.subpath },
          toGraphQlOperator(filter.operator),
          this.extractGraphQlFilterValue(filter),
        ),
    );
  }

  private extractGraphQlFilterValue(filter: Filter | FieldFilter | TableFilter): GraphQlArgumentValue {
    return (filter.operator === FilterOperator.Contains && typeof filter.value === 'string'
      ? escapeRegExp(filter.value).toString()
      : filter.value) as GraphQlArgumentValue;
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
    case FilterOperator.Contains:
      return GraphQlOperatorType.Like;
    case FilterOperator.NotIn:
      return GraphQlOperatorType.NotIn;
    case FilterOperator.ContainsKey:
      return GraphQlOperatorType.ContainsKey;
    case FilterOperator.NotContainsKey:
      return GraphQlOperatorType.NotContainsKey;
    case FilterOperator.ContainsKeyLike:
      return GraphQlOperatorType.ContainsKeyLike;
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
      return FilterOperator.NotIn;

    case GraphQlOperatorType.ContainsKey:
      return FilterOperator.ContainsKey;

    case GraphQlOperatorType.NotContainsKey:
      return FilterOperator.NotContainsKey;

    case GraphQlOperatorType.ContainsKeyLike:
      return FilterOperator.ContainsKeyLike;

    default:
      return assertUnreachable(operator);
  }
};
