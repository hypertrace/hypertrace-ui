export interface SelectOption<V> {
  value: V;
  label?: string;
  selectedLabel?: string;
  icon?: string;
  iconColor?: string;
  iconBorderType?: string;
  iconBorderColor?: string;
  iconBorderRadius?: string;
  disabled?: boolean;
}
