import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CONTENT_HOLDER_TEMPLATE, ContentHolder } from '@hypertrace/components';

@Component({
  selector: 'ht-timeline-card-container',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineCardContainerComponent extends ContentHolder {
  @Input()
  public timestamp!: number | Date;
}
