import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  JsonViewerModule,
  LabelModule,
  LoadAsyncModule,
  MessageDisplayModule,
  ToggleButtonModule
} from '@hypertrace/components';
import { SpanDetailCallBodyComponent } from './span-detail-call-body.component';

@NgModule({
  imports: [LabelModule, ToggleButtonModule, JsonViewerModule, LoadAsyncModule, CommonModule, MessageDisplayModule],
  declarations: [SpanDetailCallBodyComponent],
  exports: [SpanDetailCallBodyComponent]
})
export class SpanDetailCallBodyModule {}
