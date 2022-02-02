import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SummaryBoxComponent } from './summary-box.component';

@NgModule({
  imports: [CommonModule, TooltipModule],
  declarations: [SummaryBoxComponent],
  exports: [SummaryBoxComponent]
})
export class SummaryBoxModule {}