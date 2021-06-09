import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';

import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { ApiTraceDetails, ApiTraceDetailService } from './../api-trace-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
  template: `
    <ht-application-aware-dashboard
      [json]="this.defaultJson"
      [padding]="0"
      (dashboardReady)="this.onDashboardReady($event)"
    >
    </ht-application-aware-dashboard>
  `
})
export class ApiTraceSequenceComponent {
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
          'trace-id': '${traceId}',
          // tslint:disable-next-line: no-invalid-template-strings
          'start-time': '${startTime}'
        }
      }
    ]
  };

  public constructor(
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly apiTraceDetailService: ApiTraceDetailService
  ) {
    this.traceDetails$ = this.apiTraceDetailService.fetchTraceDetails();
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.subscriptionLifecycle.add(
      this.traceDetails$.subscribe(traceDetails => {
        dashboard.setVariable('traceId', traceDetails.id);
        dashboard.setVariable('traceType', traceDetails.type);
        dashboard.setVariable('startTime', traceDetails.startTime);
        dashboard.refresh();
      })
    );
  }
}
