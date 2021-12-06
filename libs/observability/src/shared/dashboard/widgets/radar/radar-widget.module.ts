import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule, LoadAsyncModule, SelectModule, TitledContentModule } from '@hypertrace/components';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { RadarChartModule } from '../../../components/radar/radar-chart.module';
import { EntityGraphQlQueryHandlerService } from '../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { EntityRadarDataSourceModel } from './data/entity/entity-radar-data-source.model';
import { RadarWidgetRendererComponent } from './radar-widget-renderer.component';
import { RadarWidgetModel } from './radar-widget.model';
import { RadarSeriesModel } from './series/radar-series.model';

@NgModule({
  declarations: [RadarWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [RadarWidgetModel, RadarSeriesModel, EntityRadarDataSourceModel],
      renderers: [RadarWidgetRendererComponent]
    }),
    GraphQlModule.withHandlerProviders([EntityGraphQlQueryHandlerService]),
    CommonModule,
    TitledContentModule,
    SelectModule,
    LoadAsyncModule,
    RadarChartModule,
    IconModule,
    FormattingModule
  ]
})
export class RadarWidgetModule {}
