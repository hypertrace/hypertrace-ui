import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule, MemoizeModule } from '@hypertrace/common';
import {
  IconModule,
  TableControlsModule,
  TableModule,
  TitledContentModule,
  TooltipModule
} from '@hypertrace/components';
import { WidgetHeaderModel } from '@hypertrace/dashboards';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { TracingTableCellRendererModule } from '../../../components/table/tracing-table-cell-renderer.module';
import { TableWidgetRowSelectionModel } from './selections/table-widget-row-selection.model';
import { TableWidgetColumnModel } from './table-widget-column.model';
import { TableWidgetRendererComponent } from './table-widget-renderer.component';
import { TableWidgetModel } from './table-widget.model';
@NgModule({
  declarations: [TableWidgetRendererComponent],
  imports: [
    DashboardCoreModule.with({
      models: [TableWidgetModel, TableWidgetColumnModel, TableWidgetRowSelectionModel, WidgetHeaderModel],
      renderers: [TableWidgetRendererComponent],
      propertyTypes: []
    }),
    CommonModule,
    TableModule,
    TableControlsModule,
    TracingTableCellRendererModule,
    TooltipModule,
    FormattingModule,
    IconModule,
    MemoizeModule,
    TitledContentModule
  ]
})
export class TableWidgetModule {}
