import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from '../filter-attribute';

export interface Filter<T = unknown> {
  metadata: FilterAttribute;
  field: string;
  operator: UserFilterOperator;
  value: T;
  userString: string;
  urlString: string;
}

export const enum UserFilterOperator {
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

export const USER_FILTER_OPERATORS: UserFilterOperator[] = [
  UserFilterOperator.Equals,
  UserFilterOperator.NotEquals,
  UserFilterOperator.LessThan,
  UserFilterOperator.LessThanOrEqualTo,
  UserFilterOperator.GreaterThan,
  UserFilterOperator.GreaterThanOrEqualTo,
  UserFilterOperator.In,
  UserFilterOperator.ContainsKey,
  UserFilterOperator.ContainsKeyValue
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

export const toUrlFilterOperator = (operator: UserFilterOperator): UrlFilterOperator => {
  switch (operator) {
    case UserFilterOperator.Equals:
      return UrlFilterOperator.Equals;
    case UserFilterOperator.NotEquals:
      return UrlFilterOperator.NotEquals;
    case UserFilterOperator.LessThan:
      return UrlFilterOperator.LessThan;
    case UserFilterOperator.LessThanOrEqualTo:
      return UrlFilterOperator.LessThanOrEqualTo;
    case UserFilterOperator.GreaterThan:
      return UrlFilterOperator.GreaterThan;
    case UserFilterOperator.GreaterThanOrEqualTo:
      return UrlFilterOperator.GreaterThanOrEqualTo;
    case UserFilterOperator.In:
      return UrlFilterOperator.In;
    case UserFilterOperator.ContainsKey:
      return UrlFilterOperator.ContainsKey;
    case UserFilterOperator.ContainsKeyValue:
      return UrlFilterOperator.ContainsKeyValue;
    default:
      return assertUnreachable(operator);
  }
};

export const toUserFilterOperator = (operator: UrlFilterOperator): UserFilterOperator => {
  switch (operator) {
    case UrlFilterOperator.Equals:
      return UserFilterOperator.Equals;
    case UrlFilterOperator.NotEquals:
      return UserFilterOperator.NotEquals;
    case UrlFilterOperator.LessThan:
      return UserFilterOperator.LessThan;
    case UrlFilterOperator.LessThanOrEqualTo:
      return UserFilterOperator.LessThanOrEqualTo;
    case UrlFilterOperator.GreaterThan:
      return UserFilterOperator.GreaterThan;
    case UrlFilterOperator.GreaterThanOrEqualTo:
      return UserFilterOperator.GreaterThanOrEqualTo;
    case UrlFilterOperator.In:
      return UserFilterOperator.In;
    case UrlFilterOperator.ContainsKey:
      return UserFilterOperator.ContainsKey;
    case UrlFilterOperator.ContainsKeyValue:
      return UserFilterOperator.ContainsKeyValue;
    default:
      return assertUnreachable(operator);
  }
};
