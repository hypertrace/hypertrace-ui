import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigableTabModule, PageHeaderModule } from '@hypertrace/components';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { EntityGraphQlQueryHandlerService } from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { ServiceApisListModule } from './apis/service-apis-list.module';
import { ServiceMetricsModule } from './metrics/service-metrics.module';
import { ServiceOverviewModule } from './overview/service-overview.module';
import { ServiceDetailComponent } from './service-detail.component';
import { ServiceTraceListModule } from './traces/service-trace-list.module';

@NgModule({
  declarations: [ServiceDetailComponent],
  imports: [
    RouterModule,
    NavigableTabModule,
    CommonModule,
    GraphQlModule.withHandlerProviders([EntityGraphQlQueryHandlerService]),
    // Child Routes
    ServiceOverviewModule,
    ServiceApisListModule,
    ServiceTraceListModule,
    ServiceMetricsModule,
    PageHeaderModule
  ]
})
export class ServiceDetailModule {}
