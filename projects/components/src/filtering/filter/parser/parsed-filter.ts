import { FilterOperator } from '../filter-operators';

export interface ParsedFilter<TValue> {
  key: string;
  operator: FilterOperator;
  value: TValue;
}
