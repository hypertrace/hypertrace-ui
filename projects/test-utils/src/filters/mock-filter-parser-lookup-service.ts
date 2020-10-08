import { assertUnreachable } from '@hypertrace/common';
import { ComparisonFilterParser, ContainsFilterParser, FilterOperator, InFilterParser } from '@hypertrace/components';

export const mockFilterParserLookup = (operator: FilterOperator) => {
  switch (operator) {
    case FilterOperator.Equals:
    case FilterOperator.NotEquals:
    case FilterOperator.LessThan:
    case FilterOperator.LessThanOrEqualTo:
    case FilterOperator.GreaterThan:
    case FilterOperator.GreaterThanOrEqualTo:
      return new ComparisonFilterParser();
    case FilterOperator.In:
      return new InFilterParser();
    case FilterOperator.ContainsKey:
    case FilterOperator.ContainsKeyValue:
      return new ContainsFilterParser();
    default:
      assertUnreachable(operator);
  }
};
