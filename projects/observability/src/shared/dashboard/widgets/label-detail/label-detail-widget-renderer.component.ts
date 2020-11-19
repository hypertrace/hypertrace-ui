import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { LabelDetailWidgetModel } from './label-detail-widget.model';

@Renderer({ modelClass: LabelDetailWidgetModel })
@Component({
  selector: 'ht-label-detail-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content [title]="this.model.title | htDisplayTitle" *htLoadAsync="this.data$ as additionalDetails">
      <ht-label-detail
          [label]="this.model.label"
          [icon]="this.model.icon"
          [description]="this.model.description"
          [additionalDetails]="additionalDetails"
        ></ht-label-detail>
    </ht-titled-content>
  `
})
export class LabelDetailWidgetRendererComponent extends WidgetRenderer<LabelDetailWidgetModel, string[]> {
  protected fetchData(): Observable<string[]> {
    return this.model.getData();
  }
}
