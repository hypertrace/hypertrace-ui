import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiTraceDetailService } from './../api-trace-detail.service';
import { apiTraceSequenceDashboard } from './api-trace-sequence.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.traceVariables$ as traceVariables"
      navLocation="${apiTraceSequenceDashboard.location}"
      [padding]="0"
      [variables]="traceVariables"
    >
    </ht-navigable-dashboard>
  `
})
export class ApiTraceSequenceComponent {
  public readonly traceVariables$: Observable<ApiTraceDetailVariables>;

  public constructor(private readonly apiTraceDetailService: ApiTraceDetailService) {
    this.traceVariables$ = this.apiTraceDetailService.fetchTraceDetails().pipe(
      map(details => ({
        traceId: details.id,
        traceType: details.type,
        startTime: details.startTime
      }))
    );
  }
}

interface ApiTraceDetailVariables {
  traceId: string;
  traceType: string;
  startTime?: string | number;
}
