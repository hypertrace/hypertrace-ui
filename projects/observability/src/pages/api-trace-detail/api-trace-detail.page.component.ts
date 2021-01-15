import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, SubscriptionLifecycle } from '@hypertrace/common';
import { ButtonRole, ButtonStyle, IconSize } from '@hypertrace/components';

import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { ApiTraceDetails, ApiTraceDetailService } from './api-trace-detail.service';

@Component({
  styleUrls: ['./api-trace-detail.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle, ApiTraceDetailService],
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
          <ht-summary-value
            class="summary-value"
            icon="${IconType.TraceId}"
            label="Trace ID"
            [value]="traceDetails.traceId"
          ></ht-summary-value>

          <div class="separation"></div>

          <ht-copy-shareable-link-to-clipboard class="share"></ht-copy-shareable-link-to-clipboard>

          <ht-button
            class="full-trace-button"
            role="${ButtonRole.Tertiary}"
            display="${ButtonStyle.Bordered}"
            label="See Full Trace"
            (click)="this.navigateToFullTrace(traceDetails.traceId)"
          ></ht-button>
        </div>
      </div>

      <div class="scrollable-container">
        <ht-application-aware-dashboard
          [json]="this.defaultJson"
          [padding]="0"
          (dashboardReady)="this.onDashboardReady($event)"
        >
        </ht-application-aware-dashboard>
      </div>
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
          'trace-id': '${traceId}',
          // tslint:disable-next-line: no-invalid-template-strings
          'start-time': '${startTime}'
        }
      }
    ]
  };

  public constructor(
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    protected readonly navigationService: NavigationService,
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

  public onClickBack(): void {
    this.navigationService.navigateBack();
  }

  public navigateToFullTrace(traceId: string): void {
    this.navigationService.navigateWithinApp(['/trace', traceId]);
  }
}
