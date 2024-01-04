import { FilterAttributeType } from './filter-attribute-type';
import { FilterOperator } from './filter-operators';

export interface FilterAttribute {
  name: string;
  displayName: string;
  units?: string;
  type: FilterAttributeType;
  onlySupportsAggregation?: boolean;
  onlySupportsGrouping?: boolean;
  category?: string;
  unsupportedOperators?: FilterOperator[];
}
