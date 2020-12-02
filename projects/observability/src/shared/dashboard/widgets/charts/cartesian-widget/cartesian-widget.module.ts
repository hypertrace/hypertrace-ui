import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { ButtonModule, LabelModule, LoadAsyncModule, TitledContentModule } from '@hypertrace/components';
import { DashboardPropertyEditorsModule } from '@hypertrace/dashboards';
import { DashboardCoreModule, DashboardEditorModule } from '@hypertrace/hyperdash-angular';
import { CartesianChartModule } from '../../../../components/cartesian/cartesian-chart.module';
import { CartesianAxisModel } from './axis/cartesian-axis.model';
import { CartesianWidgetRendererComponent } from './cartesian-widget-renderer.component';
import { CartesianWidgetModel } from './cartesian-widget.model';
import { SeriesArrayEditorComponent } from './series-array/series-array-editor.component';
import { SERIES_ARRAY_TYPE } from './series-array/series-array-type';
import { SeriesModel } from './series.model';

@NgModule({
  declarations: [CartesianWidgetRendererComponent, SeriesArrayEditorComponent],
  imports: [
    CommonModule,
    CartesianChartModule,
    DashboardPropertyEditorsModule,
    LabelModule,
    DashboardEditorModule,
    ButtonModule,
    DashboardCoreModule.with({
      models: [CartesianWidgetModel, SeriesModel, CartesianAxisModel],
      renderers: [CartesianWidgetRendererComponent],
      editors: [SeriesArrayEditorComponent],
      propertyTypes: [SERIES_ARRAY_TYPE]
    }),
    TitledContentModule,
    LoadAsyncModule,
    FormattingModule
  ]
})
export class CartesianWidgetModule {}
