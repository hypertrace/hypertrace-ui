import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ApiTraceNavigationHandlerModel } from './api-trace/api-trace-navigation-handler.model';
import { EntityNavigationHandlerModel } from './entity/model/entity-navigation-handler.model';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [EntityNavigationHandlerModel, ApiTraceNavigationHandlerModel]
    })
  ]
})
export class ObservabilityDashboardInteractionsModule {}
