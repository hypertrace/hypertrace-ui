import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SummaryValueModule } from '../summary-value/summary-value.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SummaryValuesComponent } from './summary-values.component';

@NgModule({
  imports: [CommonModule, TooltipModule, SummaryValueModule],
  declarations: [SummaryValuesComponent],
  exports: [SummaryValuesComponent]
})
export class SummaryValuesModule {}
