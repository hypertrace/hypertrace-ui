import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '@hypertrace/components';

@Component({
  selector: 'ht-card-container',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardContainerComponent extends ContentHolder {
  @Input()
  public showGroupedStyle: boolean = false;

  @Input()
  public disabled: boolean = false;
}
