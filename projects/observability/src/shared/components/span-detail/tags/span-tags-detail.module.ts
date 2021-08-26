import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LabelModule, ListViewModule, LoadAsyncModule } from '@hypertrace/components';
import { SpanTagsDetailComponent } from './span-tags-detail.component';

@NgModule({
  imports: [CommonModule, ListViewModule, LabelModule, LoadAsyncModule],
  declarations: [SpanTagsDetailComponent],
  exports: [SpanTagsDetailComponent]
})
export class SpanTagsDetailModule {}
