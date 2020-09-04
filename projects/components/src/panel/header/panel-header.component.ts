import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../content/content-holder';

@Component({
  selector: 'ht-panel-header',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelHeaderComponent extends ContentHolder {
  @Input()
  public ignoreInteractions: boolean = false;
}
