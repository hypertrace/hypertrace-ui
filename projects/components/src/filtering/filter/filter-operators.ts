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
  /**
   * The difference between 'Contains' and 'Like' is that 'Like' will be treated as a regex filter, not escaping
   * special characters. Whereas 'Contains' will escape special characters in order to treat it as plain text - currently
   * this assumes no backend support and is done clientside, which is why FilterOperator.Contains gets mapped to
   * GraphQlOperatorType.Like
   */
  Contains = 'CONTAINS',
  ContainsKey = 'CONTAINS_KEY',
  ContainsKeyLike = 'CONTAINS_KEY_LIKE'
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
  Contains = '_c_',
  ContainsKey = '_ck_',
  ContainsKeyLike = '_ckl_'
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
    case FilterOperator.Contains:
      return UrlFilterOperator.Contains;
    case FilterOperator.ContainsKey:
      return UrlFilterOperator.ContainsKey;
    case FilterOperator.ContainsKeyLike:
      return UrlFilterOperator.ContainsKeyLike;
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
    case UrlFilterOperator.Contains:
      return FilterOperator.Contains;
    case UrlFilterOperator.ContainsKey:
      return FilterOperator.ContainsKey;
    case UrlFilterOperator.ContainsKeyLike:
      return FilterOperator.ContainsKeyLike;
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
        FilterOperator.Contains,
        FilterOperator.ContainsKey
      ];
    case FilterOperator.Contains:
    case FilterOperator.ContainsKey:
    case FilterOperator.ContainsKeyLike:
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
