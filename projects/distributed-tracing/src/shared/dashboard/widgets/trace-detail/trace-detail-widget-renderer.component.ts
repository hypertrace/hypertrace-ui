import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { TraceDetailData } from './data/trace-detail-data-source.model';
import { TraceDetailWidgetModel } from './trace-detail-widget.model';

@Renderer({ modelClass: TraceDetailWidgetModel })
@Component({
  selector: 'ht-detail-widget-renderer',
  styleUrls: ['./trace-detail-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="trace-detail-widget-renderer fill-container">
      <div class="content" *htLoadAsync="this.data$ as data">
        <ht-span-detail [spanData]="data" [showTitleHeader]="false">
          <ht-summary-value
            class="summary-value"
            icon="${IconType.TraceId}"
            label="Trace ID"
            [value]="data.id"
          ></ht-summary-value>
          <ht-summary-value
            class="summary-value"
            icon="${IconType.StatusCode}"
            label="Status Code"
            [value]="data.statusCode"
          ></ht-summary-value>
          <ht-summary-value
            class="summary-value"
            icon="${IconType.LinkUrl}"
            label="URI"
            [value]="data.requestUrl"
          ></ht-summary-value>
        </ht-span-detail>
      </div>
    </div>
  `
})
export class TraceDetailWidgetRendererComponent extends WidgetRenderer<TraceDetailWidgetModel, TraceDetailData>
  implements OnInit {
  protected fetchData(): Observable<TraceDetailData> {
    return this.model.getData();
  }
}
