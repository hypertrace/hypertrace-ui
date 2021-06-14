import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';

import { Dashboard } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { traceDetailDashboard } from '../trace-detail.dashboard';
import { TraceDetails, TraceDetailService } from './../trace-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      class="scrollable-container"
      [padding]="0"
      navLocation="${traceDetailDashboard.location}"
      (dashboardReady)="this.onDashboardReady($event)"
    >
    </ht-navigable-dashboard>
  `
})
export class TraceSequenceComponent {
  public readonly traceDetails$: Observable<TraceDetails>;

  public constructor(
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly traceDetailService: TraceDetailService
  ) {
    this.traceDetails$ = this.traceDetailService.fetchTraceDetails();
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.subscriptionLifecycle.add(
      this.traceDetails$.subscribe(traceDetails => {
        dashboard.setVariable('traceId', traceDetails.id);
        dashboard.setVariable('spanId', traceDetails.entrySpanId);
        dashboard.setVariable('startTime', traceDetails.startTime);
        dashboard.refresh();
      })
    );
  }
}
