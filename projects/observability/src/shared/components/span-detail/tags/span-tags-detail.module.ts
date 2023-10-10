import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FilterButtonModule,
  LabelModule,
  ListViewModule,
  LoadAsyncModule,
  TooltipModule
} from '@hypertrace/components';
import { SpanTagsDetailComponent } from './span-tags-detail.component';

@NgModule({
  imports: [CommonModule, FilterButtonModule, ListViewModule, LabelModule, LoadAsyncModule, TooltipModule],
  declarations: [SpanTagsDetailComponent],
  exports: [SpanTagsDetailComponent]
})
export class SpanTagsDetailModule {}
