import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { SpanDetailLayoutStyle } from '../span-detail-layout-style';
import { SpanDetailCallHeaderType } from '../call/headers/span-detail-call-headers.component';

@Component({
  selector: 'ht-span-response-detail',
  styleUrls: ['./span-response-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-response-detail" [ngClass]="this.layout">
      <div class="section">
        <ht-span-detail-call-headers
          [data]="this.responseHeaders"
          mode="${SpanDetailCallHeaderType.Header}"
        ></ht-span-detail-call-headers>
        <ht-span-detail-call-headers
          [data]="this.responseCookies"
          mode="${SpanDetailCallHeaderType.Cookie}"
        ></ht-span-detail-call-headers>
      </div>
      <div class="section">
        <ht-span-detail-call-body [body]="this.responseBody"></ht-span-detail-call-body>
      </div>
    </div>
  `
})
export class SpanResponseDetailComponent {
  @Input()
  public responseHeaders?: Dictionary<unknown>;

  @Input()
  public responseCookies?: Dictionary<unknown>;

  @Input()
  public responseBody?: string;

  @Input()
  public layout: SpanDetailLayoutStyle = SpanDetailLayoutStyle.Horizontal;
}
