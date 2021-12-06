import { FilterOperator } from '../filter-operators';

export interface ParsedFilter<TValue> {
  field: string;
  operator: FilterOperator;
  value: TValue;
}

export interface SplitFilter<TOperator extends string> {
  lhs: string;
  operator: TOperator;
  rhs: string;
}
