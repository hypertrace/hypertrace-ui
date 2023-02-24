import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { SpanDetailData } from './data/span-detail-data-source.model';
import { SpanDetailWidgetModel } from './span-detail-widget.model';

@Renderer({ modelClass: SpanDetailWidgetModel })
@Component({
  selector: 'ht-span-detail-widget-renderer',
  styleUrls: ['./span-detail-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-detail-widget-renderer fill-container">
      <div class="content" *htLoadAsync="this.data$ as data">
        <ht-span-detail [spanData]="data" [showTitleHeader]="false">
          <ht-summary-value
            data-sensitive-pii
            class="summary-value"
            icon="${IconType.SpanId}"
            label="Span ID"
            [value]="data.id"
          ></ht-summary-value>
          <ht-summary-value
            data-sensitive-pii
            class="summary-value"
            icon="${IconType.TraceId}"
            label="Trace ID"
            [value]="data.traceId"
          ></ht-summary-value>
          <ht-summary-value
            class="summary-value"
            icon="${IconType.StatusCode}"
            label="Status Code"
            [value]="data.statusCode"
          ></ht-summary-value>
          <ht-summary-value
            data-sensitive-pii
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
export class SpanDetailWidgetRendererComponent
  extends WidgetRenderer<SpanDetailWidgetModel, SpanDetailData>
  implements OnInit
{
  protected fetchData(): Observable<SpanDetailData> {
    return this.model.getData();
  }
}
