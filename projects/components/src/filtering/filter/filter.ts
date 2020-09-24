import { FilterAttribute } from './filter-attribute';
import { FilterOperator } from './filter-operators';

export interface Filter<T> {
  metadata: FilterAttribute;
  field: string;
  operator: FilterOperator;
  value: T;
  userString: string;
  urlString: string;
}
