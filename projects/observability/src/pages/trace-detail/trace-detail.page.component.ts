import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, SubscriptionLifecycle } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { LogEvent } from '../../shared/dashboard/widgets/waterfall/waterfall/waterfall-chart';
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
          <ht-summary-value
            class="summary-value"
            icon="${IconType.TraceId}"
            label="Trace ID"
            [value]="traceDetails.id"
          ></ht-summary-value>

          <div class="separation"></div>

          <ht-copy-shareable-link-to-clipboard class="share"></ht-copy-shareable-link-to-clipboard>

          <ht-download-json
            class="download"
            [dataSource]="this.exportSpans$"
            fileName="{{ traceDetails.id }}.json"
            htTooltip="Download Trace as Json"
          ></ht-download-json>
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
export class TraceDetailPageComponent {
  public static readonly TRACE_ID_PARAM_NAME: string = 'id';

  public readonly traceDetails$: Observable<TraceDetails>;
  public readonly exportSpans$: Observable<string>;
  public readonly logEvents$: Observable<LogEvent[]>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly traceDetailService: TraceDetailService
  ) {
    this.traceDetails$ = this.traceDetailService.fetchTraceDetails();
    this.exportSpans$ = this.traceDetailService.fetchExportSpans();
    this.logEvents$ = this.traceDetailService.fetchLogEvents();
  }

  public onClickBack(): void {
    this.navigationService.navigateBack();
  }
}
