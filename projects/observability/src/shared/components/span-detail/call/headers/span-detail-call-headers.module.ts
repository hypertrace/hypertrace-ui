import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FilterButtonModule,
  LabelModule,
  ListViewModule,
  LoadAsyncModule,
  TooltipModule
} from '@hypertrace/components';
import { SpanDetailCallHeadersComponent } from './span-detail-call-headers.component';

@NgModule({
  imports: [CommonModule, FilterButtonModule, LabelModule, ListViewModule, LoadAsyncModule, TooltipModule],
  declarations: [SpanDetailCallHeadersComponent],
  exports: [SpanDetailCallHeadersComponent]
})
export class SpanDetailCallHeadersModule {}
