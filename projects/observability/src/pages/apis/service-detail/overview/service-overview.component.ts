import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { NavigableDashboardFilterConfig } from '@hypertrace/distributed-tracing';
import { map } from 'rxjs/operators';
import { ServiceDetailService } from '../service-detail.service';
import { serviceOverviewDashboard } from './service-overview.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-navigable-dashboard
      *htcLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${serviceOverviewDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </htc-navigable-dashboard>
  `
})
export class ServiceOverviewComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(serviceDetailService: ServiceDetailService) {
    this.filterConfig$ = serviceDetailService.entityFilter$.pipe(
      map(filter => ({
        implicitFilters: [filter]
      }))
    );
  }
}
