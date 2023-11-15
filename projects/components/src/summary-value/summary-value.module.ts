import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IsNilPipeModule } from '@hypertrace/common';
import { IconModule } from '../icon/icon.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SummaryValueComponent } from './summary-value.component';

@NgModule({
  imports: [CommonModule, IconModule, TooltipModule, IsNilPipeModule],
  declarations: [SummaryValueComponent],
  exports: [SummaryValueComponent],
})
export class SummaryValueModule {}
