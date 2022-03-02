import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LayoutChangeModule, TooltipModule } from '@hypertrace/components';
import { BarGaugeLegendDirective } from './bar-gauge-legend.directive';
import { BarGaugeComponent } from './bar-gauge.component';

@NgModule({
  declarations: [BarGaugeComponent, BarGaugeLegendDirective],
  imports: [CommonModule, FormattingModule, LayoutChangeModule, TooltipModule],
  exports: [BarGaugeComponent, BarGaugeLegendDirective]
})
export class BarGaugeModule {}
