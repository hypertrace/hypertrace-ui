import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { GreetingLabelWidgetModel } from './greeting-label-widget.model';

@Renderer({ modelClass: GreetingLabelWidgetModel })
@Component({
  selector: 'ht-greeting-label-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ht-greeting-label [suffixLabel]="this.model.suffixLabel"></ht-greeting-label> `
})
export class GreetingLabelWidgetRendererComponent extends WidgetRenderer<GreetingLabelWidgetModel> {
  protected fetchData(): Observable<never> {
    return EMPTY;
  }
}
