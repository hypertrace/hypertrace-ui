import { Dictionary } from '@hypertrace/common';
import { FilterOperator } from '../../filtering/filter/filter-operators';
import { TableFilter } from '../table-api';

export const enum TableControlOptionType {
  Filter = 'filter',
  Property = 'property',
  Unset = 'unset'
}

export type TableControlOption = TableUnsetControlOption | TableFilterControlOption | TablePropertyControlOption;

export type TableFilterControlOption = {
  type: TableControlOptionType.Filter;
  label: string;
  metaValue: TableFilter;
};

export type TableUnsetControlOption = {
  type: TableControlOptionType.Unset;
  label: string;
  metaValue: string;
};

export type TablePropertyControlOption = {
  type: TableControlOptionType.Property;
  label: string;
  metaValue: Dictionary<unknown>;
};

/*
 * Select Control
 */

export interface SelectControl {
  placeholder: string;
  options: TableSelectControlOption[];
}

export interface SelectChange {
  select: SelectControl;
  values: TableSelectControlOption[];
}

export type TableSelectControlOption = TableFilterControlOption;

/*
 * Checkbox Control
 */

export interface CheckboxControl {
  label: string;
  value: boolean;
  options: TableCheckboxOptions;
}

export interface CheckboxChange {
  checkbox: CheckboxControl;
  option: TableCheckboxControlOption;
}

export type TableCheckboxControlOption<T extends boolean = boolean> = TableControlOption & {
  value: T;
};

export type TableCheckboxOptions = [TableCheckboxControlOption<true>, TableCheckboxControlOption<false>];

/*
 * Util
 */

export const toInFilter = (tableFilters: TableFilter[]): TableFilter =>
  tableFilters.reduce((previousValue, currentValue) => ({
    field: previousValue.field,
    operator: FilterOperator.In,
    value: [...(Array.isArray(previousValue.value) ? previousValue.value : [previousValue.value]), currentValue.value]
  }));
