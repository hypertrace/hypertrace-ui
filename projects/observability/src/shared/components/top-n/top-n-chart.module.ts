import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TooltipModule } from '@hypertrace/components';
import { TopNChartComponent } from './top-n-chart.component';

@NgModule({
  declarations: [TopNChartComponent],
  imports: [CommonModule, TooltipModule, FormattingModule],
  exports: [TopNChartComponent]
})
export class TopNChartModule {}
