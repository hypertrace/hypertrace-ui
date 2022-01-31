import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LayoutChangeModule, TooltipModule } from '@hypertrace/components';
import { BarGaugeComponent } from './bar-gauge.component';

@NgModule({
  declarations: [BarGaugeComponent],
  imports: [CommonModule, FormattingModule, LayoutChangeModule, TooltipModule],
  exports: [BarGaugeComponent]
})
export class BarGaugeModule {}
