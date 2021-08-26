import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { NavigableDashboardFilterConfig } from '@hypertrace/observability';
import { map } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';
import { ApiDetailService } from '../api-detail.service';
import { apiTraceListDashboard } from './api-trace-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${apiTraceListDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </ht-navigable-dashboard>
  `
})
export class ApiTraceListComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(apiDetailService: ApiDetailService) {
    this.filterConfig$ = apiDetailService.entityFilter$.pipe(
      map(filter => ({
        filterBar: {
          scope: ObservabilityTraceType.Api
        },
        implicitFilters: [filter]
      }))
    );
  }
}
