import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { map } from 'rxjs/operators';
import { NavigableDashboardFilterConfig } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { BackendDetailService } from '../backend-detail.service';
import { backendMetricsDashboard } from './backend-metrics.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${backendMetricsDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </ht-navigable-dashboard>
  `
})
export class BackendMetricsComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(backendDetailService: BackendDetailService) {
    this.filterConfig$ = backendDetailService.entityFilter$.pipe(
      map(filter => ({
        implicitFilters: [filter]
      }))
    );
  }
}
