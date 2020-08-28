import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TooltipModule } from '@hypertrace/components';
import { GaugeChartComponent } from './gauge-chart.component';

@NgModule({
  declarations: [GaugeChartComponent],
  imports: [CommonModule, TooltipModule, FormattingModule],
  exports: [GaugeChartComponent]
})
export class GaugeChartModule {}
