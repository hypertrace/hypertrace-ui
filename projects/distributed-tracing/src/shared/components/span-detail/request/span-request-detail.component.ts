import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { SpanDetailLayoutStyle } from '../span-detail-layout-style';

@Component({
  selector: 'htc-span-request-detail',
  styleUrls: ['./span-request-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-request-detail" [ngClass]="this.layout">
      <div class="section">
        <htc-span-detail-call-headers [headers]="this.requestHeaders"></htc-span-detail-call-headers>
      </div>
      <div class="section">
        <htc-span-detail-call-body [body]="this.requestBody"></htc-span-detail-call-body>
      </div>
    </div>
  `
})
export class SpanRequestDetailComponent {
  @Input()
  public requestHeaders?: Dictionary<unknown>;

  @Input()
  public requestBody?: string;

  @Input()
  public layout: SpanDetailLayoutStyle = SpanDetailLayoutStyle.Horizontal;
}
