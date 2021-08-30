import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { DetailSheetInteractionModule } from './detail-sheet/detail-sheet-interaction.module';
import { SpanTraceNavigationHandlerModel } from './span-trace/model/span-trace-navigation-handler.model';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [SpanTraceNavigationHandlerModel]
    }),
    DetailSheetInteractionModule
  ]
})
export class TracingDashboardInteractionsModule {}
