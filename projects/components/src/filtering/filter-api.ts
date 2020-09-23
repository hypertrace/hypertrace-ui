import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from './filter-attribute';

export interface Filter<T> {
  metadata: FilterAttribute;
  field: string;
  operator: FilterOperator;
  value: T;
  userString: string;
  urlString: string;
}

export const enum FilterOperator {
  Equals = '=',
  NotEquals = '!=',
  LessThan = '<',
  LessThanOrEqualTo = '<=',
  GreaterThan = '>',
  GreaterThanOrEqualTo = '>=',
  In = 'IN',
  ContainsKey = 'CONTAINS_KEY',
  ContainsKeyValue = 'CONTAINS_KEY_VALUE'
}

export const enum UrlFilterOperator {
  Equals = '_eq_',
  NotEquals = '_neq_',
  LessThan = '_lt_',
  LessThanOrEqualTo = '_lte_',
  GreaterThan = '_gt_',
  GreaterThanOrEqualTo = '_gte_',
  In = '_in_',
  ContainsKey = '_ck_',
  ContainsKeyValue = '_ckv_'
}

export const USER_FILTER_OPERATORS: FilterOperator[] = [
  FilterOperator.Equals,
  FilterOperator.NotEquals,
  FilterOperator.LessThan,
  FilterOperator.LessThanOrEqualTo,
  FilterOperator.GreaterThan,
  FilterOperator.GreaterThanOrEqualTo,
  FilterOperator.In,
  FilterOperator.ContainsKey,
  FilterOperator.ContainsKeyValue
];

export const URL_FILTER_OPERATORS: UrlFilterOperator[] = [
  UrlFilterOperator.Equals,
  UrlFilterOperator.NotEquals,
  UrlFilterOperator.LessThan,
  UrlFilterOperator.LessThanOrEqualTo,
  UrlFilterOperator.GreaterThan,
  UrlFilterOperator.GreaterThanOrEqualTo,
  UrlFilterOperator.In,
  UrlFilterOperator.ContainsKey,
  UrlFilterOperator.ContainsKeyValue
];

export const toUrlFilterOperator = (operator: FilterOperator): UrlFilterOperator => {
  switch (operator) {
    case FilterOperator.Equals:
      return UrlFilterOperator.Equals;
    case FilterOperator.NotEquals:
      return UrlFilterOperator.NotEquals;
    case FilterOperator.LessThan:
      return UrlFilterOperator.LessThan;
    case FilterOperator.LessThanOrEqualTo:
      return UrlFilterOperator.LessThanOrEqualTo;
    case FilterOperator.GreaterThan:
      return UrlFilterOperator.GreaterThan;
    case FilterOperator.GreaterThanOrEqualTo:
      return UrlFilterOperator.GreaterThanOrEqualTo;
    case FilterOperator.In:
      return UrlFilterOperator.In;
    case FilterOperator.ContainsKey:
      return UrlFilterOperator.ContainsKey;
    case FilterOperator.ContainsKeyValue:
      return UrlFilterOperator.ContainsKeyValue;
    default:
      return assertUnreachable(operator);
  }
};

export const fromUrlFilterOperator = (operator: UrlFilterOperator): FilterOperator => {
  switch (operator) {
    case UrlFilterOperator.Equals:
      return FilterOperator.Equals;
    case UrlFilterOperator.NotEquals:
      return FilterOperator.NotEquals;
    case UrlFilterOperator.LessThan:
      return FilterOperator.LessThan;
    case UrlFilterOperator.LessThanOrEqualTo:
      return FilterOperator.LessThanOrEqualTo;
    case UrlFilterOperator.GreaterThan:
      return FilterOperator.GreaterThan;
    case UrlFilterOperator.GreaterThanOrEqualTo:
      return FilterOperator.GreaterThanOrEqualTo;
    case UrlFilterOperator.In:
      return FilterOperator.In;
    case UrlFilterOperator.ContainsKey:
      return FilterOperator.ContainsKey;
    case UrlFilterOperator.ContainsKeyValue:
      return FilterOperator.ContainsKeyValue;
    default:
      return assertUnreachable(operator);
  }
};
