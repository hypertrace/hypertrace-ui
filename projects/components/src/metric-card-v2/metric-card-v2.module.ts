import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardV2Component } from './metric-card-v2.component';
import { IconModule, LabelModule } from '../public-api';

@NgModule({
  declarations: [MetricCardV2Component],
  imports: [CommonModule, LabelModule, IconModule],
  exports: [MetricCardV2Component]
})
export class MetricCardV2Module {}
