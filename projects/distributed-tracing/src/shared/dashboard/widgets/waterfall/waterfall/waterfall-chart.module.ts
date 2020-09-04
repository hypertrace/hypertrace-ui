import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SequenceChartModule, TableModule, TooltipModule } from '@hypertrace/components';
import { SpanNameTableCellParser } from './span-name/span-name-table-cell-parser';
import { SpanNameTableCellRendererComponent } from './span-name/span-name-table-cell-renderer.component';
import { WaterfallChartComponent } from './waterfall-chart.component';

@NgModule({
  declarations: [WaterfallChartComponent, SpanNameTableCellRendererComponent],
  imports: [
    SequenceChartModule,
    CommonModule,
    TableModule.withCellParsers([SpanNameTableCellParser]),
    TableModule.withCellRenderers([SpanNameTableCellRendererComponent]),
    TooltipModule
  ],
  exports: [WaterfallChartComponent]
})
export class WaterfallChartModule {}
