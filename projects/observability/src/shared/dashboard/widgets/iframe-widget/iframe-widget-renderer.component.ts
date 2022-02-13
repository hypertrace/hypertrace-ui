import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';

import { IFrameWidgetModel } from './iframe-widget.model';

@Renderer({ modelClass: IFrameWidgetModel })
@Component({
  selector: 'ht-iframe-widget-renderer',
  template: ` <ht-iframe [source]="this.model.source"></ht-iframe> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./iframe-widget-renderer.component.scss']
})
export class IframeWidgetRendererComponent extends WidgetRenderer<IFrameWidgetModel> implements OnInit {
  protected fetchData(): Observable<unknown> {
    throw new Error('Method not implemented.');
  }
}
