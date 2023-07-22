import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectOptionComponent } from './select-option.component';

@Component({
  selector: 'ht-select-control-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '' // No template, just gathering data
})
export class SelectControlOptionComponent<V> extends SelectOptionComponent<V> {
  @Input()
  public position: SelectControlOptionPosition = SelectControlOptionPosition.Top;
}

export enum SelectControlOptionPosition {
  // Can be extended for bottom later.
  Top = 'top'
}
