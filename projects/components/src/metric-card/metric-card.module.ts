import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../public-api';
import { MetricCardComponent } from './metric-card.component';

@NgModule({
  imports: [CommonModule, IconModule, LabelModule],
  declarations: [MetricCardComponent],
  exports: [MetricCardComponent]
})
export class MetricCardModule {}
