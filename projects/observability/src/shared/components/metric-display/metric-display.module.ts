import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { MetricDisplayComponent } from './metric-display.component';

@NgModule({
  declarations: [MetricDisplayComponent],
  exports: [MetricDisplayComponent],
  imports: [CommonModule, FormattingModule]
})
export class MetricDisplayModule {}
