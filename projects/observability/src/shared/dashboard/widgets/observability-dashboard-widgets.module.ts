import { NgModule } from '@angular/core';
import { ObservabilityTableCellRendererModule } from '../../components/table/observability-table-cell-renderer.module';
import { CardListWidgetModule } from './card-list/card-list-widget.module';
import { CartesianWidgetModule } from './charts/cartesian-widget/cartesian-widget.module';
import { DonutWidgetModule } from './donut/donut-widget.module';
import { MetricDisplayWidgetModule } from './metric-display/metric-display-widget.module';
import { RadarWidgetModule } from './radar/radar-widget.module';
import { TopNWidgetModule } from './top-n/top-n-widget.module';
import { TopologyWidgetModule } from './topology/topology-widget.module';
import { GaugeWidgetModule } from './gauge/gauge-widget.module';

@NgModule({
  imports: [
    MetricDisplayWidgetModule,
    RadarWidgetModule,
    TopNWidgetModule,
    TopologyWidgetModule,
    ObservabilityTableCellRendererModule,
    DonutWidgetModule,
    CartesianWidgetModule,
    CardListWidgetModule,
    GaugeWidgetModule
  ]
})
export class ObservabilityDashboardWidgetsModule {}
