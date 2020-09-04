import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { GreetingLabelWidgetModel } from './greeting-label-widget.model';

@Renderer({ modelClass: GreetingLabelWidgetModel })
@Component({
  selector: 'htc-greeting-label-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <htc-greeting-label [suffixLabel]="this.model.suffixLabel"></htc-greeting-label> `
})
export class GreetingLabelWidgetRendererComponent extends WidgetRenderer<GreetingLabelWidgetModel> {
  protected fetchData(): Observable<never> {
    return EMPTY;
  }
}
