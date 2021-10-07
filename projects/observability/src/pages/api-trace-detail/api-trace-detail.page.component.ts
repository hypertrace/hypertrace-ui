import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationParams, NavigationParamsType, NavigationService, SubscriptionLifecycle } from '@hypertrace/common';
import { ButtonRole, ButtonStyle, IconSize } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { LogEvent } from '../../shared/dashboard/widgets/waterfall/waterfall/waterfall-chart';
import { ScopeQueryParam } from '../explorer/explorer.component';
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
          <ht-link class="link" [paramsOrUrl]="buildNavParamsForExplorer(traceDetails.traceId)" class="session-id-link">
            <ht-summary-value
              class="summary-value"
              icon="${IconType.TraceId}"
              label="Trace ID"
              [value]="traceDetails.traceId"
            ></ht-summary-value>
          </ht-link>

          <div class="separation"></div>

          <ht-copy-shareable-link-to-clipboard class="share"></ht-copy-shareable-link-to-clipboard>

          <ht-button
            class="full-trace-button"
            role="${ButtonRole.Tertiary}"
            display="${ButtonStyle.Bordered}"
            label="See Full Trace"
            (click)="this.navigateToFullTrace(traceDetails.traceId, traceDetails.startTime)"
          ></ht-button>
        </div>
      </div>

      <ht-navigable-tab-group class="tabs">
        <ht-navigable-tab path="sequence"> Sequence </ht-navigable-tab>
        <ng-container *ngIf="this.logEvents$ | async as logEvents">
          <ht-navigable-tab path="logs" [labelTag]="logEvents.length"> Logs </ht-navigable-tab>
        </ng-container>
      </ht-navigable-tab-group>

      <div class="scrollable-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class ApiTraceDetailPageComponent {
  public static readonly TRACE_ID_PARAM_NAME: string = 'id';

  public readonly traceDetails$: Observable<ApiTraceDetails>;
  public readonly logEvents$: Observable<LogEvent[]>;

  public constructor(
    protected readonly navigationService: NavigationService,
    private readonly apiTraceDetailService: ApiTraceDetailService
  ) {
    this.traceDetails$ = this.apiTraceDetailService.fetchTraceDetails();
    this.logEvents$ = this.apiTraceDetailService.fetchLogEvents();
  }

  public onClickBack(): void {
    this.navigationService.navigateBack();
  }

  public navigateToFullTrace(traceId: string, startTime: string): void {
    this.navigationService.navigateWithinApp(['/trace', traceId, { startTime: startTime }]);
  }

  public buildNavParamsForExplorer = (traceId: string): NavigationParams => ({
    navType: NavigationParamsType.InApp,
    path: '/explorer',
    relativeTo: undefined,
    replaceCurrentHistory: false,
    queryParams: {
      filter: ['trace', `traceId_eq_${traceId}`],
      scope: ScopeQueryParam.EndpointTraces
    }
  });
}
