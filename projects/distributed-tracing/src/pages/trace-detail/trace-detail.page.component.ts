import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, SubscriptionLifecycle } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';

import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { TraceDetails, TraceDetailService } from './trace-detail.service';

@Component({
  styleUrls: ['./trace-detail.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle, TraceDetailService],
  template: `
    <div class="trace-detail" *htcLoadAsync="this.traceDetails$ as traceDetails">
      <div class="header">
        <div class="back">
          <htc-icon
            (click)="this.onClickBack()"
            icon="${IconType.ArrowLeft}"
            size="${IconSize.Small}"
            class="arrow"
          ></htc-icon>
          <htc-label (click)="this.onClickBack()" label="Back" class="label"></htc-label>
        </div>

        <htc-label [label]="traceDetails.titleString" class="title"></htc-label>

        <div class="summary-row">
          <htc-summary-value
            class="summary-value"
            icon="${IconType.Time}"
            [value]="traceDetails.timeString"
          ></htc-summary-value>
          <htc-summary-value class="summary-value" icon="${IconType.Id}" [value]="traceDetails.id"></htc-summary-value>
        </div>
      </div>

      <div class="scrollable-container">
        <htc-application-aware-dashboard
          [json]="this.defaultJson"
          [padding]="0"
          (dashboardReady)="this.onDashboardReady($event)"
        >
        </htc-application-aware-dashboard>
      </div>
    </div>
  `
})
export class TraceDetailPageComponent {
  public static readonly TRACE_ID_PARAM_NAME: string = 'id';
  public readonly traceDetails$: Observable<TraceDetails>;

  public readonly defaultJson: ModelJson = {
    type: 'container-widget',
    layout: {
      type: 'auto-container-layout',
      'enable-style': false
    },
    children: [
      {
        type: 'waterfall-widget',
        title: 'Sequence Diagram',
        data: {
          type: 'trace-waterfall-data-source',
          // tslint:disable-next-line: no-invalid-template-strings
          'trace-id': '${traceId}',
          // tslint:disable-next-line: no-invalid-template-strings
          'entry-span-id': '${spanId}'
        }
      }
    ]
  };

  public constructor(
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly navigationService: NavigationService,
    private readonly traceDetailService: TraceDetailService
  ) {
    this.traceDetails$ = this.traceDetailService.fetchTraceDetails();
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.subscriptionLifecycle.add(
      this.traceDetails$.subscribe(traceDetails => {
        dashboard.setVariable('traceId', traceDetails.id);
        dashboard.setVariable('spanId', traceDetails.entrySpanId);
        dashboard.refresh();
      })
    );
  }

  public onClickBack(): void {
    this.navigationService.navigateBack();
  }
}
