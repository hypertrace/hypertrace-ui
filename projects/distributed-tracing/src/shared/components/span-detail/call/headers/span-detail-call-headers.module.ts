import { NgModule } from '@angular/core';

import { LabelModule, LabelTagModule, ListViewModule, LoadAsyncModule } from '@hypertrace/components';
import { SpanDetailCallHeadersComponent } from './span-detail-call-headers.component';

@NgModule({
  imports: [LabelModule, ListViewModule, LoadAsyncModule, LabelTagModule],
  declarations: [SpanDetailCallHeadersComponent],
  exports: [SpanDetailCallHeadersComponent]
})
export class SpanDetailCallHeadersModule {}
