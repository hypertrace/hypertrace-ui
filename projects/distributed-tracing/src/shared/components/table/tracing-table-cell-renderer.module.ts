import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule, TableModule, TooltipModule } from '@hypertrace/components';
import { MetricTableCellParser } from './data-cell/metric/metric-table-cell-parser';
import { MetricTableCellRendererComponent } from './data-cell/metric/metric-table-cell-renderer.component';
import { TraceStatusTableCellParser } from './data-cell/trace-status/trace-status-table-cell-parser';
import { TraceStatusTableCellRendererComponent } from './data-cell/trace-status/trace-status-table-cell-renderer.component';

@NgModule({
  imports: [
    CommonModule,
    TableModule.withCellParsers([MetricTableCellParser, TraceStatusTableCellParser]),
    TableModule.withCellRenderers([MetricTableCellRendererComponent, TraceStatusTableCellRendererComponent]),
    IconModule,
    TooltipModule,
    FormattingModule
  ],
  declarations: [MetricTableCellRendererComponent, TraceStatusTableCellRendererComponent],
  exports: [MetricTableCellRendererComponent, TraceStatusTableCellRendererComponent]
})
export class TracingTableCellRendererModule {}
