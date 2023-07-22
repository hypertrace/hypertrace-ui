import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LabelModule, PopoverModule } from '@hypertrace/components';
import { MarkerTooltipComponent } from './marker-tooltip.component';

@NgModule({
  declarations: [MarkerTooltipComponent],
  exports: [MarkerTooltipComponent],
  imports: [PopoverModule, CommonModule, FormattingModule, LabelModule]
})
export class MarkerTooltipModule {}
