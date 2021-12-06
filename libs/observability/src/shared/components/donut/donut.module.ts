import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutChangeModule } from '@hypertrace/components';
import { LegendModule } from '../legend/legend.module';
import { ChartTooltipModule } from '../utils/chart-tooltip/chart-tooltip.module';
import { DonutComponent } from './donut.component';

@NgModule({
  declarations: [DonutComponent],
  exports: [DonutComponent],
  imports: [CommonModule, LayoutChangeModule, LegendModule, ChartTooltipModule]
})
export class DonutModule {}
