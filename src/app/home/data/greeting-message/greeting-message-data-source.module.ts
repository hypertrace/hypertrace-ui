import { NgModule } from '@angular/core';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ExploreGraphQlQueryHandlerService } from '@hypertrace/observability';
import { GreetingMessageDataSourceModel } from './greeting-message-data-source.model';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [GreetingMessageDataSourceModel]
    }),
    GraphQlModule.withHandlerProviders([ExploreGraphQlQueryHandlerService])
  ]
})
export class GreetingMessageDataSourceModule {}
