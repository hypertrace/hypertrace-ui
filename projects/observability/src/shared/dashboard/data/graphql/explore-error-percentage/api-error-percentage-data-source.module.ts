import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { ExploreErrorPercentageDataSourceModel } from './explore-error-percentage-data-source.model';
import { ExploreGraphQlQueryHandlerService } from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

@NgModule({
  declarations: [],
  imports: [
    DashboardCoreModule.with({
      models: [ExploreErrorPercentageDataSourceModel]
    }),
    GraphQlModule.withHandlerProviders([ExploreGraphQlQueryHandlerService]),
    CommonModule
  ]
})
export class ApiErrorPercentageDataSourceModule {}
