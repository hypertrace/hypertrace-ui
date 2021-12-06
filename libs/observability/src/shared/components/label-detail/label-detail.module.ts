import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ButtonModule,
  EventBlockerModule,
  IconModule,
  LabelModule,
  PopoverModule,
  TooltipModule
} from '@hypertrace/components';
import { LabelDetailComponent } from './label-detail.component';

@NgModule({
  declarations: [LabelDetailComponent],
  exports: [LabelDetailComponent],
  imports: [CommonModule, EventBlockerModule, IconModule, ButtonModule, PopoverModule, LabelModule, TooltipModule]
})
export class LabelDetailModule {}
