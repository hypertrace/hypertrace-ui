import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { SpanDetailLayoutStyle } from '../span-detail-layout-style';

@Component({
  selector: 'ht-span-request-detail',
  styleUrls: ['./span-request-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-request-detail" [ngClass]="this.layout">
      <div class="section">
        <div class="section-item">
          <ht-span-detail-call-headers [data]="this.requestHeaders" title="Headers"></ht-span-detail-call-headers>
        </div>
        <div class="section-item">
          <ht-span-detail-call-headers [data]="this.requestCookies" title="Cookies"></ht-span-detail-call-headers>
        </div>
      </div>
      <div class="section">
        <ht-span-detail-call-body [body]="this.requestBody"></ht-span-detail-call-body>
      </div>
    </div>
  `
})
export class SpanRequestDetailComponent {
  @Input()
  public requestHeaders?: Dictionary<unknown>;

  @Input()
  public requestCookies?: Dictionary<unknown>;

  @Input()
  public requestBody?: string;

  @Input()
  public layout: SpanDetailLayoutStyle = SpanDetailLayoutStyle.Horizontal;
}
