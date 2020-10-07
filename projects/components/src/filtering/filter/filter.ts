import { FilterAttribute } from './filter-attribute';
import { FilterOperator } from './filter-operators';

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
