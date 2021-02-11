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
  option: TableControlOption<unknown, boolean>;
}

export const enum TableControlOptionType {
  Filter = 'filter',
  Property = 'property',
  UnsetFilter = 'unset-filter'
}

export interface TableControlOption<TMetaValue = unknown, TValue = unknown> {
  type: TableControlOptionType;
  label: string;
  metaValue: TMetaValue; // Used in a query - type based on TableWidgetControlOptionType
  value?: TValue; // If a control needs to carry a value, use this (example: checkbox boolean)
}

export interface TableUnsetControlOption extends TableControlOption<string, undefined> {
  type: TableControlOptionType.UnsetFilter;
  metaValue: string;
}

export interface TableFilterControlOption extends TableControlOption<TableFilter> {
  type: TableControlOptionType.Filter;
  metaValue: TableFilter;
}

export interface TablePropertyControlOption extends TableControlOption<Dictionary<unknown>> {
  type: TableControlOptionType.Property;
  metaValue: Dictionary<unknown>;
}

export type TableCheckboxOptions = [TableControlOption<unknown, true>, TableControlOption<unknown, false>];
