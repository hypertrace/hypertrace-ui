import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../content/content-holder';

@Component({
  selector: 'htc-popover-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CONTENT_HOLDER_TEMPLATE
})
export class PopoverContentComponent extends ContentHolder {}
