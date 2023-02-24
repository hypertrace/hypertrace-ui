export interface ToggleButtonState {
  isFirst: boolean;
  isLast: boolean;
  isDisabled: boolean;
  selectedLabel: string;
  viewMode: ToggleViewMode;
}

export const enum ToggleViewMode {
  ButtonGroup = 'button-group',
  Button = 'button',
  Text = 'text'
}
