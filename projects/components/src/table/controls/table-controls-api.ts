import { Dictionary } from '@hypertrace/common';
import { SelectOption } from '../../select/select-option';
import { TableFilter } from '../table-api';

export interface SelectControl {
  placeholder?: string;
  default?: SelectOption<TableControlOption>;
  options: SelectOption<TableControlOption>[];
}

export interface SelectChange {
  select: SelectControl;
  value: TableControlOption;
}

export interface CheckboxControl {
  label: string;
  value: boolean;
  options: TableCheckboxOptions;
}

export interface CheckboxChange {
  checkbox: CheckboxControl;
  option: TableControlOption<boolean>;
}

export const enum TableControlOptionType {
  Filter = 'filter',
  Property = 'property',
  UnsetFilter = 'unset-filter'
}

export type TableControlOption<T = unknown> =
  | TableUnsetFilterControlOption<T>
  | TableFilterControlOption<T>
  | TablePropertyControlOption<T>;

interface TableControlOptionBase<T> {
  value?: T;
}
export interface TableUnsetFilterControlOption<T = unknown> extends TableControlOptionBase<T> {
  type: TableControlOptionType.UnsetFilter;
  metaValue: string;
}

export interface TableFilterControlOption<T = unknown> extends TableControlOptionBase<T> {
  type: TableControlOptionType.Filter;
  metaValue: TableFilter;
}

export interface TablePropertyControlOption<T = unknown> extends TableControlOptionBase<T> {
  type: TableControlOptionType.Property;
  metaValue: Dictionary<unknown>;
}

export type TableCheckboxControlOption<T extends boolean> = TableControlOption<T> & { label: string };

export type TableCheckboxOptions = [TableCheckboxControlOption<true>, TableCheckboxControlOption<false>];
