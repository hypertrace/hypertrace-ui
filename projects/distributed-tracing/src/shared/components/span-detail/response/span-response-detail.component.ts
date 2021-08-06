import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { SpanDetailLayoutStyle } from '../span-detail-layout-style';

@Component({
  selector: 'ht-span-response-detail',
  styleUrls: ['./span-response-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-response-detail" [ngClass]="this.layout">
      <div class="section">
        <ht-span-detail-call-headers [headers]="this.responseHeaders"></ht-span-detail-call-headers>
      </div>
      <div class="section">
        <ht-span-detail-call-body [body]="this.responseBody$ | async"></ht-span-detail-call-body>
      </div>
    </div>
  `
})
export class SpanResponseDetailComponent {
  @Input()
  public responseHeaders?: Dictionary<unknown>;

  @Input()
  public responseBody$?: Observable<string>;

  @Input()
  public layout: SpanDetailLayoutStyle = SpanDetailLayoutStyle.Horizontal;
}
