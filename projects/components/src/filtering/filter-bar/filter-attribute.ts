import { FilterType } from './filter-type';

export interface FilterAttribute {
  name: string;
  displayName: string;
  units?: string;
  type: FilterType;
}
