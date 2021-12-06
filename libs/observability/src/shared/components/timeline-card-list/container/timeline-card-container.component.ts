import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '@hypertrace/components';

@Component({
  selector: 'ht-timeline-card-container',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineCardContainerComponent extends ContentHolder {
  @Input()
  public timestamp!: number | Date;

  @Input()
  public similarToPrevious?: boolean;
}
