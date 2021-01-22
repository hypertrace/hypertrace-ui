import { KeyValue } from '@angular/common';
import { SelectOption } from '../../select/select-option';

export interface SelectFilter {
  placeholder?: string;
  options: SelectOption<KeyValue<string, unknown>>[];
}

export interface SelectChange {
  select: SelectFilter;
  value: KeyValue<string, unknown>;
}
