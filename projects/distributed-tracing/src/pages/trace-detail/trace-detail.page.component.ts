import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, SubscriptionLifecycle } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';

import { Dashboard } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { traceDetailDashboard } from './trace-detail.dashboard';
import { TraceDetails, TraceDetailService } from './trace-detail.service';
@Component({
  styleUrls: ['./trace-detail.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle, TraceDetailService],
  template: `
    <div class="trace-detail" *htLoadAsync="this.traceDetails$ as traceDetails">
      <div class="header">
        <div class="back">
          <ht-icon
            (click)="this.onClickBack()"
            icon="${IconType.ArrowLeft}"
            size="${IconSize.Small}"
            class="arrow"
          ></ht-icon>
          <ht-label (click)="this.onClickBack()" label="Back" class="label"></ht-label>
        </div>

        <ht-label [label]="traceDetails.titleString" class="title"></ht-label>

        <div class="summary-row">
          <ht-summary-value
            class="summary-value"
            icon="${IconType.Time}"
            [value]="traceDetails.timeString"
          ></ht-summary-value>
          <ht-summary-value class="summary-value" icon="${IconType.Id}" [value]="traceDetails.id"></ht-summary-value>

          <div class="separation"></div>

          <ht-copy-shareable-link-to-clipboard class="share"></ht-copy-shareable-link-to-clipboard>
        </div>
      </div>

      <ht-navigable-dashboard
        class="scrollable-container"
        navLocation="${traceDetailDashboard.location}"
        (dashboardReady)="this.onDashboardReady($event)"
      >
      </ht-navigable-dashboard>
    </div>
  `
})
export class TraceDetailPageComponent {
  public static readonly TRACE_ID_PARAM_NAME: string = 'id';
  public readonly traceDetails$: Observable<TraceDetails>;

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
