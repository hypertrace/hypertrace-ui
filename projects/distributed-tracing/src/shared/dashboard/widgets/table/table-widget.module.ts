import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule, MemoizeModule } from '@hypertrace/common';
import { IconModule, TableModule, TitledContentModule, TooltipModule } from '@hypertrace/components';
import { WidgetHeaderModel } from '@hypertrace/dashboards';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { TracingTableCellRendererModule } from '../../../components/table/tracing-table-cell-renderer.module';
import { TableWidgetColumnModel } from './table-widget-column.model';
import { TableWidgetRendererComponent } from './table-widget-renderer.component';
import { TableWidgetModel } from './table-widget.model';

@NgModule({
  declarations: [TableWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [TableWidgetModel, TableWidgetColumnModel, WidgetHeaderModel],
      renderers: [TableWidgetRendererComponent],
      propertyTypes: []
    }),
    CommonModule,
    TableModule,
    TracingTableCellRendererModule,
    TooltipModule,
    FormattingModule,
    IconModule,
    MemoizeModule,
    TitledContentModule
  ]
})
export class TableWidgetModule {}
