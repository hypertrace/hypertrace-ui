import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';

import { IFrameWidgetModel } from './iframe-widget.model';

@Renderer({ modelClass: IFrameWidgetModel })
@Component({
  selector: 'ht-iframe-widget-renderer',
  template: ` <iframe width="100%" height="100%" frameBorder="0" [src]="this.model.source"></iframe> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./iframe-widget-renderer.component.scss']
})
export class IframeWidgetRendererComponent extends WidgetRenderer<IFrameWidgetModel> {
  protected fetchData(): Observable<unknown> {
    return EMPTY;
  }
}
