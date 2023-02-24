import { IconType } from '@hypertrace/assets-library';

export interface ToggleItem<TValue = unknown> {
  label?: string;
  icon?: IconType;
  value?: TValue;
}
