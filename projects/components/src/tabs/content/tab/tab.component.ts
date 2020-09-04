import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../../content/content-holder';

@Component({
  selector: 'htc-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tab.component.scss'],
  template: CONTENT_HOLDER_TEMPLATE
})
export class TabComponent extends ContentHolder {
  @Input()
  public label!: string;
}
