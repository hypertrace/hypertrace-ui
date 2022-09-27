import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../content/content-holder';

@Component({
  selector: 'ht-popover-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CONTENT_HOLDER_TEMPLATE
})
export class PopoverTriggerComponent extends ContentHolder {
  @Input()
  public type: PopoverTriggerType = PopoverTriggerType.Click;
}

export const enum PopoverTriggerType {
  Click = 'click',
  Hover = 'hover'
}
