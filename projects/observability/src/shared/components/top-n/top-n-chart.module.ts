import { NgModule } from '@angular/core';
import { HistogramChartModule } from '../histogram/histogram-chart.module';
import { TopNChartComponent } from './top-n-chart.component';

@NgModule({
  declarations: [TopNChartComponent],
  imports: [HistogramChartModule],
  exports: [TopNChartComponent]
})
export class TopNChartModule {}
