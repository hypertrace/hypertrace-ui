import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { ConditionalModel } from './conditional.model';

@Renderer({ modelClass: ConditionalModel })
@Component({
  selector: 'ht-conditional-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-container [hdaDashboardModel]="this.data$ | async"> </ng-container> `
})
export class ConditionalWidgetRendererComponent extends WidgetRenderer<ConditionalModel> {
  protected fetchData(): Observable<object> {
    return this.model.getChildModel();
  }
}
