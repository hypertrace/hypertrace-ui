import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { BarGaugeComponent } from './bar-gauge.component';

@NgModule({
  declarations: [BarGaugeComponent],
  imports: [CommonModule, FormattingModule],
  exports: [BarGaugeComponent]
})
export class BarGaugeModule {}
