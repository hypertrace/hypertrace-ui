import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { LayoutChangeModule, TooltipModule } from '@hypertrace/components';
import { BasicGaugeComponent } from './basic-gauge.component';

@NgModule({
  declarations: [BasicGaugeComponent],
  exports: [BasicGaugeComponent],
  imports: [CommonModule, FormattingModule, TooltipModule, LayoutChangeModule]
})
export class BasicGaugeModule {}