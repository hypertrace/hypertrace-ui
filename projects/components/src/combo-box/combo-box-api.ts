export interface ComboBoxOption<TValue = string> {
  text: string;
  value?: TValue;
  icon?: string;
  tooltip?: string;
}

export interface ComboBoxResult<TValue = string> {
  text: string | undefined;
  option?: ComboBoxOption<TValue>; // Undefined if result text doesn't match a supplied option
}

export const enum ComboBoxMode {
  // These values are used in css
  Input = 'input',
  Chip = 'chip'
}
