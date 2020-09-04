import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { NavigableDashboardFilterConfig } from '@hypertrace/distributed-tracing';
import { map } from 'rxjs/operators';
import { ServiceDetailService } from '../service-detail.service';
import { serviceMetricsDashboard } from './service-metrics.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-navigable-dashboard
      *htcLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${serviceMetricsDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </htc-navigable-dashboard>
  `
})
export class ServiceMetricsComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(serviceDetailService: ServiceDetailService) {
    this.filterConfig$ = serviceDetailService.entityFilter$.pipe(
      map(filter => ({
        implicitFilters: [filter]
      }))
    );
  }
}
