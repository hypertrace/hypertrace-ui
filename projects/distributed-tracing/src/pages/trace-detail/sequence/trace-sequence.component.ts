import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TraceDetailService } from './../trace-detail.service';
import { traceSequenceDashboard } from './trace-sequence.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.traceVariables$ as traceVariables"
      class="scrollable-container"
      [padding]="0"
      [variables]="traceVariables"
      navLocation="${traceSequenceDashboard.location}"
    >
    </ht-navigable-dashboard>
  `
})
export class TraceSequenceComponent {
  public readonly traceVariables$: Observable<TraceDetailVariables>;

  public constructor(private readonly traceDetailService: TraceDetailService) {
    this.traceVariables$ = this.traceDetailService.fetchTraceDetails().pipe(
      map(details => ({
        traceId: details.id,
        traceType: details.type,
        startTime: details.startTime,
        spanId: details.entrySpanId
      }))
    );
  }
}

interface TraceDetailVariables {
  traceId: string;
  traceType: string;
  startTime?: string | number;
  spanId?: string;
}
