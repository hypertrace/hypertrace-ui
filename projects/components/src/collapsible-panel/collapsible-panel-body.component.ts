import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTENT_HOLDER_TEMPLATE, ContentHolder } from '../content/content-holder';

@Component({
  selector: 'ht-collapsible-panel-body',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsiblePanelBodyComponent extends ContentHolder {}
