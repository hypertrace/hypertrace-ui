import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';

export interface ToggleItem<TValue = unknown> {
  label?: string;
  icon?: IconType;
  value?: TValue;
  tagValue?: string;
  tagColor?: Color;
  tagBackgroundColor?: Color;
}
