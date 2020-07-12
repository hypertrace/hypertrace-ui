import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutChangeModule, TooltipModule } from '@hypertrace/components';
import { ChartTooltipModule } from '../utils/chart-tooltip/chart-tooltip.module';
import { RadarChartAxisService } from './axis/radar-chart-axis.service';
import { RadarChartLayoutService } from './layout/radar-chart-layout.service';
import { RadarChartLegendService } from './legend/radar-chart-legend.service';
import { RadarChartComponent } from './radar-chart.component';
import { RadarChartService } from './radar-chart.service';
import { RadarSeriesRendererService } from './series/radar-series-renderer.service';
import { RadarChartTooltipService } from './tooltip/radar-chart-tooltip.service';

@NgModule({
  imports: [CommonModule, TooltipModule, LayoutChangeModule, ChartTooltipModule],
  providers: [
    RadarChartService,
    RadarChartAxisService,
    RadarChartLayoutService,
    RadarSeriesRendererService,
    RadarChartLegendService,
    RadarChartTooltipService
  ],
  declarations: [RadarChartComponent],
  exports: [RadarChartComponent]
})
export class RadarChartModule {}
