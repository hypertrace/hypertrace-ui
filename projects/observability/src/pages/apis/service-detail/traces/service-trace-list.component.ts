import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { map } from 'rxjs/operators';
import { NavigableDashboardFilterConfig } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';
import { ServiceDetailService } from '../service-detail.service';
import { serviceTraceListDashboard } from './service-trace-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${serviceTraceListDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </ht-navigable-dashboard>
  `
})
export class ServiceTraceListComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(serviceDetailService: ServiceDetailService) {
    this.filterConfig$ = serviceDetailService.entityFilter$.pipe(
      map(filter => ({
        filterBar: {
          scope: ObservabilityTraceType.Api
        },
        implicitFilters: [filter]
      }))
    );
  }
}
