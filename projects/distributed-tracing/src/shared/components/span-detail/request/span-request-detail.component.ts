import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { SpanDetailLayoutStyle } from '../span-detail-layout-style';

@Component({
  selector: 'ht-span-request-detail',
  styleUrls: ['./span-request-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-request-detail" [ngClass]="this.layout">
      <div class="section">
        <ht-span-detail-call-headers [headers]="this.requestHeaders"></ht-span-detail-call-headers>
      </div>
      <div class="section" *htLoadAsync="this.requestBody$ as requestBody">
        <ht-span-detail-call-body [body]="requestBody"></ht-span-detail-call-body>
      </div>
    </div>
  `
})
export class SpanRequestDetailComponent {
  @Input()
  public requestHeaders?: Dictionary<unknown>;

  @Input()
  public requestBody$?: Observable<string>;

  @Input()
  public layout: SpanDetailLayoutStyle = SpanDetailLayoutStyle.Horizontal;
}
