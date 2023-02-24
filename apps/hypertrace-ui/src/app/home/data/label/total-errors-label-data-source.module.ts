import { NgModule } from '@angular/core';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ExploreGraphQlQueryHandlerService } from '@hypertrace/observability';
import { TotalErrorsLabelDataSourceModel } from './total-errors-label-data-source.model';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [TotalErrorsLabelDataSourceModel]
    }),
    GraphQlModule.withHandlerProviders([ExploreGraphQlQueryHandlerService])
  ]
})
export class TotalErrorsLabelDataSourceModule {}
