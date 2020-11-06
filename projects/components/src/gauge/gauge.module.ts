import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TooltipModule } from './../tooltip/tooltip.module';
import { GaugeComponent } from './gauge.component';

@NgModule({
  declarations: [GaugeComponent],
  exports: [GaugeComponent],
  imports: [CommonModule, FormattingModule, TooltipModule]
})
export class GaugeModule {}
