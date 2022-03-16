import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../public-api';

@Component({
  selector: 'ht-draggable-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CONTENT_HOLDER_TEMPLATE
})
export class DraggableItemComponent<T> extends ContentHolder {
  @Input()
  public disabled: boolean = false;

  @Input()
  public data?: T;
}
