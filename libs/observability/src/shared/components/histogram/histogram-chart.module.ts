import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TooltipModule } from '@hypertrace/components';
import { HistogramChartComponent } from './histogram-chart.component';

@NgModule({
  imports: [CommonModule, TooltipModule, FormattingModule],
  declarations: [HistogramChartComponent],
  exports: [HistogramChartComponent]
})
export class HistogramChartModule {}
