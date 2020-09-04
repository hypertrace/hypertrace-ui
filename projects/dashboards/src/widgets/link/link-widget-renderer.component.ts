import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { LinkWidgetModel } from './link-widget.model';

@Renderer({ modelClass: LinkWidgetModel })
@Component({
  selector: 'htc-link-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <htc-link [url]="this.model.url">{{ this.getDisplayText() }}</htc-link> `
})
export class LinkWidgetRendererComponent extends WidgetRenderer<LinkWidgetModel> {
  protected fetchData(): Observable<never> {
    return EMPTY;
  }

  public getDisplayText(): string {
    return this.model.displayText ?? this.model.url;
  }
}
