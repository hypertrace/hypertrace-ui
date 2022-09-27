import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../content/content-holder';

@Component({
  selector: 'ht-popover-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CONTENT_HOLDER_TEMPLATE
})
export class PopoverContentComponent extends ContentHolder {
  @Input()
  public data?: unknown;
}
