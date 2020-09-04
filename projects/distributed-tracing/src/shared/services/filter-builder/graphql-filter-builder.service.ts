import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { Filter, FilterType, UserFilterOperator } from '@hypertrace/components';
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
          this.toGraphQlOperator(filter.operator),
          this.toGraphQlArgumentValue(filter.metadata.type, filter.value)
        )
    );
  }

  private toGraphQlOperator(operator: UserFilterOperator): GraphQlOperatorType {
    switch (operator) {
      case UserFilterOperator.Equals:
        return GraphQlOperatorType.Equals;
      case UserFilterOperator.NotEquals:
        return GraphQlOperatorType.NotEquals;
      case UserFilterOperator.LessThan:
        return GraphQlOperatorType.LessThan;
      case UserFilterOperator.LessThanOrEqualTo:
        return GraphQlOperatorType.LessThanOrEqualTo;
      case UserFilterOperator.GreaterThan:
        return GraphQlOperatorType.GreaterThan;
      case UserFilterOperator.GreaterThanOrEqualTo:
        return GraphQlOperatorType.GreaterThanOrEqualTo;
      case UserFilterOperator.In:
        return GraphQlOperatorType.In;
      case UserFilterOperator.ContainsKey:
        return GraphQlOperatorType.ContainsKey;
      case UserFilterOperator.ContainsKeyValue:
        return GraphQlOperatorType.ContainsKeyValue;
      default:
        return assertUnreachable(operator);
    }
  }

  private toGraphQlArgumentValue(type: FilterType, value: unknown): GraphQlArgumentValue {
    switch (type) {
      case FilterType.Boolean:
      case FilterType.Number:
      case FilterType.String:
      case FilterType.StringMap:
      case FilterType.Timestamp:
        return value as GraphQlArgumentValue;
      default:
        return assertUnreachable(type);
    }
  }
}
