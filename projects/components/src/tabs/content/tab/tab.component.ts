import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../../content/content-holder';

@Component({
  selector: 'ht-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tab.component.scss'],
  template: CONTENT_HOLDER_TEMPLATE
})
export class TabComponent extends ContentHolder {
  @Input()
  public label!: string;

  @Input()
  public labelTag?: string;

  @Input()
  public info?: string | TemplateRef<unknown>;
}
