import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { map } from 'rxjs/operators';
import { NavigableDashboardFilterConfig } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { ApiDetailService } from '../api-detail.service';
import { apiOverviewDashboard } from './api-overview.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${apiOverviewDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </ht-navigable-dashboard>
  `
})
export class ApiOverviewComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(apiDetailService: ApiDetailService) {
    this.filterConfig$ = apiDetailService.entityFilter$.pipe(
      map(filter => ({
        implicitFilters: [filter]
      }))
    );
  }
}
