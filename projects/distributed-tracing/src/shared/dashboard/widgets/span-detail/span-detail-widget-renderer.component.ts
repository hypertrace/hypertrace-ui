import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { SpanDetailData } from './data/span-detail-data-source.model';
import { SpanDetailWidgetModel } from './span-detail-widget.model';

@Renderer({ modelClass: SpanDetailWidgetModel })
@Component({
  selector: 'htc-span-detail-widget-renderer',
  styleUrls: ['./span-detail-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-detail-widget-renderer fill-container">
      <div class="content" *htcLoadAsync="this.data$ as data">
        <htc-span-detail [spanData]="data" [showTitleHeader]="false">
          <htc-summary-value
            class="summary-value"
            icon="${IconType.TraceId}"
            label="Span ID"
            [value]="data.id"
          ></htc-summary-value>
          <htc-summary-value
            class="summary-value"
            icon="${IconType.StatusCode}"
            label="Status Code"
            [value]="data.statusCode"
          ></htc-summary-value>
          <htc-summary-value
            class="summary-value"
            icon="${IconType.LinkUrl}"
            label="URI"
            [value]="data.requestUrl"
          ></htc-summary-value>
        </htc-span-detail>
      </div>
    </div>
  `
})
export class SpanDetailWidgetRendererComponent extends WidgetRenderer<SpanDetailWidgetModel, SpanDetailData>
  implements OnInit {
  protected fetchData(): Observable<SpanDetailData> {
    return this.model.getData();
  }
}
