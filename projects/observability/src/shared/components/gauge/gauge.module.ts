import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LayoutChangeModule, TooltipModule } from '@hypertrace/components';
import { GaugeComponent } from './gauge.component';

@NgModule({
  declarations: [GaugeComponent],
  exports: [GaugeComponent],
  imports: [CommonModule, FormattingModule, TooltipModule, LayoutChangeModule]
})
export class GaugeModule {}
