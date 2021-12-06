import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SummaryValueModule } from '../summary-value/summary-value.module';
import { SummaryCardComponent } from './summary-card.component';

@NgModule({
  exports: [SummaryCardComponent],
  imports: [CommonModule, SummaryValueModule],
  declarations: [SummaryCardComponent]
})
export class SummaryCardModule {}
