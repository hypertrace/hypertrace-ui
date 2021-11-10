import { Dictionary } from '@hypertrace/common';
import { FilterOperator } from '../../filtering/filter/filter-operators';
import { TableFilter } from '../table-api';

export const enum TableControlOptionType {
  Filter = 'filter',
  Property = 'property',
  Unset = 'unset'
}

export type TableControlOption = TableUnsetControlOption | TableFilterControlOption | TablePropertyControlOption;

export interface TableFilterControlOption {
  type: TableControlOptionType.Filter;
  label: string;
  metaValue: TableFilter;
  applied?: boolean;
}

export interface TableUnsetControlOption {
  type: TableControlOptionType.Unset;
  label: string;
  metaValue: string;
  applied?: boolean;
}

export interface TablePropertyControlOption {
  type: TableControlOptionType.Property;
  label: string;
  metaValue: Dictionary<unknown>;
  applied?: boolean;
}

/*
 * Select Control
 */

export interface TableSelectControl {
  placeholder: string;
  isMultiSelect: boolean;
  options: TableSelectControlOption[];
}

export interface TableSelectChange {
  select: TableSelectControl;
  values: TableSelectControlOption[];
}

export type TableSelectControlOption = TableFilterControlOption;

/*
 * Checkbox Control
 */

export interface TableCheckboxControl {
  label: string;
  value: boolean;
  options: TableCheckboxOptions;
}

export interface TableCheckboxChange {
  checkbox: TableCheckboxControl;
  option: TableCheckboxControlOption;
}

export type TableCheckboxControlOption<T = boolean> = TableControlOption & {
  value: T;
};

export type TableCheckboxOptions = [TableCheckboxControlOption<true>, TableCheckboxControlOption<false>];

/*
 * Util
 */

export const toInFilter = (tableFilters: TableFilter[]): TableFilter =>
  tableFilters.reduce((previousValue, currentValue) => {
    if (currentValue.operator !== FilterOperator.Equals || previousValue.field !== currentValue.field) {
      throw Error('Filters must all contain same field and use = operator');
    }

    return {
      field: previousValue.field,
      operator: FilterOperator.In,
      value: [...(Array.isArray(previousValue.value) ? previousValue.value : [previousValue.value]), currentValue.value]
    };
  });
