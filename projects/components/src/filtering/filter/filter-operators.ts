import { assertUnreachable } from '@hypertrace/common';

export const enum FilterOperator {
  Equals = '=',
  NotEquals = '!=',
  LessThan = '<',
  LessThanOrEqualTo = '<=',
  GreaterThan = '>',
  GreaterThanOrEqualTo = '>=',
  Like = '~',
  In = 'IN',
  ContainsKey = 'CONTAINS_KEY'
}

export const enum UrlFilterOperator {
  Equals = '_eq_',
  NotEquals = '_neq_',
  LessThan = '_lt_',
  LessThanOrEqualTo = '_lte_',
  GreaterThan = '_gt_',
  GreaterThanOrEqualTo = '_gte_',
  Like = '_lk_',
  In = '_in_',
  ContainsKey = '_ck_'
}

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
    case FilterOperator.Like:
      return UrlFilterOperator.Like;
    case FilterOperator.In:
      return UrlFilterOperator.In;
    case FilterOperator.ContainsKey:
      return UrlFilterOperator.ContainsKey;
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
    case UrlFilterOperator.Like:
      return FilterOperator.Like;
    case UrlFilterOperator.In:
      return FilterOperator.In;
    case UrlFilterOperator.ContainsKey:
      return FilterOperator.ContainsKey;
    default:
      return assertUnreachable(operator);
  }
};

export const incompatibleOperators = (operator: FilterOperator): FilterOperator[] => {
  switch (operator) {
    case FilterOperator.In:
    case FilterOperator.Equals:
      return [
        FilterOperator.In,
        FilterOperator.Equals,
        FilterOperator.NotEquals,
        FilterOperator.LessThan,
        FilterOperator.LessThanOrEqualTo,
        FilterOperator.GreaterThan,
        FilterOperator.GreaterThanOrEqualTo,
        FilterOperator.Like,
        FilterOperator.ContainsKey
      ];
    case FilterOperator.ContainsKey:
    case FilterOperator.NotEquals:
    case FilterOperator.Like:
      return [FilterOperator.In, FilterOperator.Equals];
    case FilterOperator.LessThan:
    case FilterOperator.LessThanOrEqualTo:
      return [FilterOperator.In, FilterOperator.Equals, FilterOperator.LessThan, FilterOperator.LessThanOrEqualTo];
    case FilterOperator.GreaterThan:
    case FilterOperator.GreaterThanOrEqualTo:
      return [
        FilterOperator.In,
        FilterOperator.Equals,
        FilterOperator.GreaterThan,
        FilterOperator.GreaterThanOrEqualTo
      ];
    default:
      assertUnreachable(operator);
  }

  throw Error(`Unknown operator type '${operator}'.`);
};
