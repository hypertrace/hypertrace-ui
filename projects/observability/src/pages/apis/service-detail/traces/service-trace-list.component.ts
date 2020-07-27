import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { NavigableDashboardFilterConfig } from '@hypertrace/distributed-tracing';
import { map } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';
import { ServiceDetailService } from '../service-detail.service';
import { serviceTraceListDashboard } from './service-trace-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-navigable-dashboard
      *htcLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${serviceTraceListDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </htc-navigable-dashboard>
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
