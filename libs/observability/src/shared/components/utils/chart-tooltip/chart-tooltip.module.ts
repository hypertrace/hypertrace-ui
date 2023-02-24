import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LabelModule, PopoverModule } from '@hypertrace/components';
import { ChartTooltipBuilderService } from './chart-tooltip-builder.service';
import { DefaultChartTooltipComponent } from './default/default-chart-tooltip.component';

@NgModule({
  declarations: [DefaultChartTooltipComponent],
  exports: [DefaultChartTooltipComponent],
  providers: [ChartTooltipBuilderService],
  imports: [PopoverModule, CommonModule, FormattingModule, LabelModule]
})
export class ChartTooltipModule {}
