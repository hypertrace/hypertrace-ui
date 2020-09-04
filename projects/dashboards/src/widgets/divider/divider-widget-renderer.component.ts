import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { DividerWidgetModel } from './divider-widget.model';

@Renderer({ modelClass: DividerWidgetModel })
@Component({
  selector: 'htc-divider-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./divider-widget-renderer.component.scss'],
  template: `
    <div class="divider-widget">
      <htc-divider class="divider"></htc-divider>
    </div>
  `
})
export class DividerWidgetRendererComponent extends WidgetRenderer<DividerWidgetModel> {
  protected fetchData(): Observable<never> {
    return EMPTY;
  }
}
