import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dashboard } from '@hypertrace/hyperdash';
import { LogEvent } from '../../../dashboard/widgets/waterfall/waterfall/waterfall-chart';
import { spanLogEventsDashboard } from './span-log-events.dashboard';

@Component({
  selector: 'ht-span-log-events',
  styleUrls: ['./span-log-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="span-log-events">
    <div class="title">Logs</div>
    <ht-navigable-dashboard
      [padding]="'0'"
      navLocation="${spanLogEventsDashboard.location}"
      (dashboardReady)="this.onDashboardReady($event)"
    >
    </ht-navigable-dashboard>
  </div> `
})
export class SpanLogEventsComponent {
  @Input()
  public logEvents?: LogEvent[];

  @Input()
  public startTime?: number;

  public onDashboardReady(dashboard: Dashboard): void {
    dashboard.setVariable('logEvents', this.logEvents);
    dashboard.setVariable('startTime', this.startTime);
  }
}
