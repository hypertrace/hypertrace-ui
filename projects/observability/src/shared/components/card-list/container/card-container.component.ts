import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTENT_HOLDER_TEMPLATE, ContentHolder } from '@hypertrace/components';

@Component({
  selector: 'ht-card-container',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardContainerComponent extends ContentHolder {}
