import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LabelModule, LayoutChangeModule, SelectModule } from '@hypertrace/components';
import { CartesianExplorerContextMenuModule } from '../../dashboard/widgets/charts/cartesian-widget/interactions/cartesian-explorer-context-menu/cartesian-explorer-context-menu.module';
import { IntervalSelectModule } from '../interval-select/interval-select.module';
import { ChartTooltipModule } from '../utils/chart-tooltip/chart-tooltip.module';
import { CartesianChartComponent } from './cartesian-chart.component';
import { CartesianIntervalControlComponent } from './d3/legend/cartesian-interval-control.component';
import { CartesianSummaryComponent } from './d3/legend/cartesian-summary.component';

@NgModule({
  declarations: [CartesianChartComponent, CartesianIntervalControlComponent, CartesianSummaryComponent],
  exports: [CartesianChartComponent],
  imports: [
    CommonModule,
    FormattingModule,
    LabelModule,
    SelectModule,
    LayoutChangeModule,
    IntervalSelectModule,
    ChartTooltipModule,
    CartesianExplorerContextMenuModule
  ]
})
export class CartesianChartModule {}
