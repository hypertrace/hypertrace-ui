import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GaugeChartModule } from '../gauge/gauge-chart.module';
import { TopNChartComponent } from './top-n-chart.component';

@NgModule({
  declarations: [TopNChartComponent],
  imports: [CommonModule, GaugeChartModule],
  exports: [TopNChartComponent]
})
export class TopNChartModule {}
