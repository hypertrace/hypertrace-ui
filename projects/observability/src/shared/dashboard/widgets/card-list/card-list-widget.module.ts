import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LoadAsyncModule, SummaryCardModule, TitledContentModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { CardListModule } from '../../../components/card-list/card-list.module';
import { CardListWidgetModel } from './card-list-widget-model';
import { CardListWidgetRendererComponent } from './card-list-widget-renderer.component';

@NgModule({
  declarations: [CardListWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [CardListWidgetModel],
      renderers: [CardListWidgetRendererComponent]
    }),
    CommonModule,
    TitledContentModule,
    LoadAsyncModule,
    FormattingModule,
    SummaryCardModule,
    CardListModule
  ]
})
export class CardListWidgetModule {}
