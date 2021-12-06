import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { TextWidgetModel } from './text-widget.model';

@Renderer({ modelClass: TextWidgetModel })
@Component({
  selector: 'ht-text-widget-renderer',
  styleUrls: ['./text-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-widget">
      <span class="primary-text" [ngClass]="this.model.primaryTextStyle">{{ this.model.text }}</span>
      <span class="secondary-text">{{ this.model.secondaryText }}</span>
    </div>
  `
})
export class TextWidgetRendererComponent extends WidgetRenderer<TextWidgetModel> {
  protected fetchData(): Observable<never> {
    return EMPTY;
  }
}
