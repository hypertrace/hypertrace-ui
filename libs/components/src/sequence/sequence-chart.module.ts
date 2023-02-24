import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutChangeModule } from '../layout/layout-change.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SequenceChartAxisService } from './axis/sequence-chart-axis.service';
import { SequenceChartLayoutService } from './layout/sequence-chart-layout.service';
import { SequenceBarRendererService } from './renderer/sequence-bar-renderer.service';
import { SequenceChartComponent } from './sequence-chart.component';
import { SequenceChartService } from './sequence-chart.service';

@NgModule({
  imports: [CommonModule, TooltipModule, LayoutChangeModule],
  providers: [SequenceChartService, SequenceChartAxisService, SequenceChartLayoutService, SequenceBarRendererService],
  declarations: [SequenceChartComponent],
  exports: [SequenceChartComponent]
})
export class SequenceChartModule {}
