import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, SubscriptionLifecycle } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';

import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { ApiTraceDetails, ApiTraceDetailService } from './api-trace-detail.service';

@Component({
  styleUrls: ['./api-trace-detail.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle, ApiTraceDetailService],
  template: `
    <div class="trace-detail" *htcLoadAsync="this.traceDetails$ as traceDetails">
      <div class="back">
        <htc-icon
          (click)="this.onClickBack()"
          icon="${IconType.KeyboardBackspace}"
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

      <htc-application-aware-dashboard
        class="dashboard-content"
        [json]="this.defaultJson"
        (dashboardReady)="this.onDashboardReady($event)"
      >
      </htc-application-aware-dashboard>
    </div>
  `
})
export class ApiTraceDetailPageComponent {
  public static readonly TRACE_ID_PARAM_NAME: string = 'id';
  public readonly traceDetails$: Observable<ApiTraceDetails>;

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
          type: 'api-trace-waterfall-data-source',
          // tslint:disable-next-line: no-invalid-template-strings
          'trace-id': '${traceId}'
        }
      }
    ]
  };

  public constructor(
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly navigationService: NavigationService,
    private readonly apiTraceDetailService: ApiTraceDetailService
  ) {
    this.traceDetails$ = this.apiTraceDetailService.fetchTraceDetails();
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.subscriptionLifecycle.add(
      this.traceDetails$.subscribe(traceDetails => {
        dashboard.setVariable('traceId', traceDetails.id);
        dashboard.setVariable('traceType', traceDetails.type);
        dashboard.refresh();
      })
    );
  }

  public onClickBack(): void {
    this.navigationService.navigateBack();
  }
}
