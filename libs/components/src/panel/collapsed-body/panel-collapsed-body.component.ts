import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../content/content-holder';

@Component({
  selector: 'ht-panel-collapsed-body',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelCollapsedBodyComponent extends ContentHolder {}
