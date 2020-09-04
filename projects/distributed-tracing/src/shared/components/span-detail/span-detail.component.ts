import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { SpanData } from './span-data';
import { SpanDetailLayoutStyle } from './span-detail-layout-style';

@Component({
  selector: 'htc-span-detail',
  styleUrls: ['./span-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-detail" *ngIf="this.spanData">
      <htc-span-detail-title-header
        class="title-header"
        *ngIf="this.showTitleHeader"
        [serviceName]="this.spanData.serviceName"
        [protocolName]="this.spanData.protocolName"
        [apiName]="this.spanData.apiName"
        (closed)="this.closed.emit()"
      ></htc-span-detail-title-header>

      <div class="summary-container">
        <ng-content></ng-content>
      </div>

      <htc-tab-group class="tabs-group">
        <htc-tab label="Request" *ngIf="this.showRequestTab">
          <htc-span-request-detail
            class="request"
            [layout]="this.layout"
            [requestHeaders]="this.spanData.requestHeaders"
            [requestBody]="this.spanData.requestBody"
          ></htc-span-request-detail>
        </htc-tab>
        <htc-tab label="Response" *ngIf="this.showResponseTab">
          <htc-span-response-detail
            class="response"
            [layout]="this.layout"
            [responseHeaders]="this.spanData.responseHeaders"
            [responseBody]="this.spanData.responseBody"
          ></htc-span-response-detail>
        </htc-tab>
        <htc-tab label="Attributes" class="attributes">
          <htc-span-tags-detail [tags]="this.spanData.tags"></htc-span-tags-detail>
        </htc-tab>
      </htc-tab-group>
    </div>
  `
})
export class SpanDetailComponent implements OnChanges {
  @Input()
  public spanData?: SpanData;

  @Input()
  public showTitleHeader: boolean = false;

  @Input()
  public layout: SpanDetailLayoutStyle = SpanDetailLayoutStyle.Horizontal;

  @Output()
  public readonly closed: EventEmitter<void> = new EventEmitter<void>();

  public showRequestTab?: boolean;
  public showResponseTab?: boolean;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.spanData) {
      this.showRequestTab = !isEmpty(this.spanData?.requestHeaders) || !isEmpty(this.spanData?.requestBody);
      this.showResponseTab = !isEmpty(this.spanData?.responseHeaders) || !isEmpty(this.spanData?.responseBody);
    }
  }
}
