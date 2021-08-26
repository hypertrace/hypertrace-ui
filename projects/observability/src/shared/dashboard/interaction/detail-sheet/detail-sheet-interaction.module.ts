import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { DetailSheetInteractionContainerComponent } from './container/detail-sheet-interaction-container.component';
import { DetailSheetInteractionHandlerModel } from './detail-sheet-interaction-handler.model';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [DetailSheetInteractionHandlerModel]
    })
  ],
  declarations: [DetailSheetInteractionContainerComponent]
})
export class DetailSheetInteractionModule {}
