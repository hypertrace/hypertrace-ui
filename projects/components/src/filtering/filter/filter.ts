import { FilterAttribute } from './filter-attribute';
import { FilterOperator, incompatibleOperators } from './filter-operators';

export interface Filter<TValue = unknown> extends IncompleteFilter {
  operator: FilterOperator;
  value: TValue;
  urlString: string;
}

export interface IncompleteFilter<TValue = unknown> extends FieldFilter<TValue> {
  metadata: FilterAttribute;
  userString: string;
}

export interface FieldFilter<TValue = unknown> {
  field: string;
  subpath?: string;
  operator?: FilterOperator;
  value?: TValue;
}

export const areCompatibleFilters = (f1: Filter, f2: Filter) =>
  f1.field !== f2.field || f1.subpath !== f2.subpath || !incompatibleOperators(f1.operator).includes(f2.operator);
