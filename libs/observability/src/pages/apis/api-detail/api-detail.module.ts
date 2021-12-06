import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigableTabModule, PageHeaderModule } from '@hypertrace/components';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { EntityGraphQlQueryHandlerService } from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { ApiDetailComponent } from './api-detail.component';
import { ApiMetricsModule } from './metrics/api-metrics.module';
import { ApiOverviewModule } from './overview/api-overview.module';
import { ApiTraceListModule } from './traces/api-trace-list.module';

@NgModule({
  declarations: [ApiDetailComponent],
  imports: [
    RouterModule,
    NavigableTabModule,
    CommonModule,
    GraphQlModule.withHandlerProviders([EntityGraphQlQueryHandlerService]),
    // Child Routes
    ApiOverviewModule,
    ApiTraceListModule,
    ApiMetricsModule,
    PageHeaderModule
  ]
})
export class ApiDetailModule {}
