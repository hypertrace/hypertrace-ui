import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { map } from 'rxjs/operators';
import { NavigableDashboardFilterConfig } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';
import { BackendDetailService } from '../backend-detail.service';
import { backendTraceListDashboard } from './backend-trace-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${backendTraceListDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </ht-navigable-dashboard>
  `
})
export class BackendTraceListComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(backendDetailService: BackendDetailService) {
    this.filterConfig$ = backendDetailService.entityFilter$.pipe(
      map(filter => ({
        filterBar: {
          scope: ObservabilityTraceType.Backend
        },
        implicitFilters: [filter]
      }))
    );
  }
}
