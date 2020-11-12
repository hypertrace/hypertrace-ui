import { ChangeDetectionStrategy, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ModelJson, Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WidgetRenderer } from '../widget-renderer';
import { ConditionalModel } from './conditional.model';

@Renderer({ modelClass: ConditionalModel })
@Component({
  selector: 'ht-conditional-widget',
  styleUrls: ['./conditional-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="conditional-widget">
      <ng-container [hdaDashboardModel]="this.getModel() | async"> </ng-container>
    </div>
  `
})
export class ConditionalWidgetRendererComponent extends WidgetRenderer<ConditionalModel> {
  @ViewChild('containerContent', { read: ViewContainerRef, static: true })
  public container!: ViewContainerRef;

  public getModel(): Observable<ModelJson> {
    return this.model.getModel().pipe(takeUntil(this.destroyed$));
  }

  protected fetchData(): Observable<ModelJson> {
    return this.getModel();
  }
}
