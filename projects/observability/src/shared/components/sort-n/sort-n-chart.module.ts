import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TooltipModule } from '@hypertrace/components';
import { SortNChartComponent } from './sort-n-chart.component';

@NgModule({
  declarations: [SortNChartComponent],
  imports: [CommonModule, TooltipModule, FormattingModule],
  exports: [SortNChartComponent]
})
export class SortNChartModule {}
