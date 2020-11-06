import { FilterAttributeType } from './filter-attribute-type';

export interface FilterAttribute {
  name: string;
  displayName: string;
  units?: string;
  type: FilterAttributeType;
  requiresAggregation?: boolean;
}
