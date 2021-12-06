import { NgModule } from '@angular/core';
import { LayoutChangeModule } from '@hypertrace/components';
import { LegendModule } from '../legend/legend.module';
import { ChartTooltipModule } from '../utils/chart-tooltip/chart-tooltip.module';
import { BubbleChartComponent } from './bubble-chart.component';

@NgModule({
  declarations: [BubbleChartComponent],
  exports: [BubbleChartComponent],
  imports: [LayoutChangeModule, LegendModule, ChartTooltipModule]
})
export class BubbleChartModule {}
