import { FilterAttribute } from './filter-attribute';
import { FilterOperator, incompatibleOperators } from './filter-operators';

export interface Filter<T = unknown> extends IncompleteFilter {
  operator: FilterOperator;
  value: T;
  urlString: string;
}

export interface IncompleteFilter {
  metadata: FilterAttribute;
  field: string;
  operator?: FilterOperator;
  value?: unknown;
  userString: string;
}

export const areEqualFilters = (f1: IncompleteFilter, f2: IncompleteFilter) =>
  (f1.field === f2.field && f1.operator === undefined) ||
  f2.operator === undefined ||
  (f1.operator === f2.operator && f1.value === undefined) ||
  f2.value === undefined ||
  f1.value === f2.value;

export const areCompatibleFilters = (f1: Filter, f2: Filter) =>
  f1.field !== f2.field || (f1.field === f2.field && !incompatibleOperators(f1.operator).includes(f2.operator));
