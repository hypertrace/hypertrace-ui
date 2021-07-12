export interface SelectOption<V> {
  value: V;
  label: string;
  selectedLabel?: string;
  icon?: string;
  iconColor?: string;
  disabled?: boolean;
}
