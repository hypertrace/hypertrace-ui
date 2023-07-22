import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LogEventsTableViewType } from '../../../shared/components/log-events/log-events-table.component';
import { LogEvent } from '../../../shared/dashboard/widgets/waterfall/waterfall/waterfall-chart';
import { ApiTraceDetailService } from './../api-trace-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="this.logEvents$ | async as logEvents">
      <ht-log-events-table
        [logEvents]="logEvents"
        logEventsTableViewType="${LogEventsTableViewType.Detailed}"
      ></ht-log-events-table>
    </ng-container>
  `
})
export class ApiTraceLogsComponent {
  public readonly logEvents$: Observable<LogEvent[]>;

  public constructor(private readonly apiTraceDetailService: ApiTraceDetailService) {
    this.logEvents$ = this.apiTraceDetailService.fetchLogEvents();
  }
}
