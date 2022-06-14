import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule, LabelModule } from '../public-api';
import { MetricCardV2Component } from './metric-card-v2.component';

@NgModule({
  declarations: [MetricCardV2Component],
  imports: [CommonModule, LabelModule, IconModule],
  exports: [MetricCardV2Component]
})
export class MetricCardV2Module {}
