import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplayObservable } from '@hypertrace/common';
import { NavigableDashboardFilterConfig } from '@hypertrace/distributed-tracing';
import { map } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';
import { ApiDetailService } from '../api-detail.service';
import { apiMetricsDashboard } from './api-metrics-dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-navigable-dashboard
      *htcLoadAsync="this.filterConfig$ as filterConfig"
      navLocation="${apiMetricsDashboard.location}"
      [filterConfig]="filterConfig"
    >
    </htc-navigable-dashboard>
  `
})
export class ApiMetricsComponent {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public constructor(apiDetailService: ApiDetailService) {
    this.filterConfig$ = apiDetailService.entityFilter$.pipe(
      map(filter => ({
        scope: ObservabilityTraceType.Api,
        implicitFilters: [filter],
        hideFilterBar: true
      }))
    );
  }
}
