import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigableTabModule } from '@hypertrace/components';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { ObservabilityDashboardModule } from '../../../shared/dashboard/observability-dashboard.module';
import { EntityGraphQlQueryHandlerService } from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { BackendDetailComponent } from './backend-detail.component';
import { BackendMetricsModule } from './metrics/backend-metrics.module';
import { BackendOverviewModule } from './overview/backend-overview.module';
import { BackendTraceListModule } from './traces/backend-trace-list.module';

@NgModule({
  declarations: [BackendDetailComponent],
  imports: [
    RouterModule,
    NavigableTabModule,
    CommonModule,
    ObservabilityDashboardModule,
    GraphQlModule.withHandlerProviders([EntityGraphQlQueryHandlerService]),
    // Child Routes
    BackendOverviewModule,
    BackendTraceListModule,
    BackendMetricsModule
  ]
})
export class BackendDetailModule {}
