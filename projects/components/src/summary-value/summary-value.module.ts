import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LinkModule } from '../link/link.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SummaryValueComponent } from './summary-value.component';

@NgModule({
  imports: [CommonModule, IconModule, TooltipModule, LinkModule],
  declarations: [SummaryValueComponent],
  exports: [SummaryValueComponent]
})
export class SummaryValueModule {}
