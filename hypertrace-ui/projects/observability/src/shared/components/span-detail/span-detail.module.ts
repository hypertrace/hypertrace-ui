import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ButtonModule,
  CopyToClipboardModule,
  IconModule,
  JsonViewerModule,
  LabelModule,
  ListViewModule,
  LoadAsyncModule,
  MessageDisplayModule,
  TabModule,
  ToggleButtonModule,
  ToggleGroupModule,
  TooltipModule,
} from '@hypertrace/components';
import { LogEventsTableModule } from '../log-events/log-events-table.module';
import { SpanExitCallsModule } from './exit-calls/span-exit-calls.module';
import { SpanDetailTitleHeaderModule } from './headers/title/span-detail-title-header.module';
import { SpanRequestDetailModule } from './request/span-request-detail.module';
import { SpanResponseDetailModule } from './response/span-response-detail.module';
import { SpanDetailComponent } from './span-detail.component';
import { SpanTagsDetailModule } from './tags/span-tags-detail.module';
import { MemoizeModule } from '@hypertrace/common';

@NgModule({
  imports: [
    CommonModule,
    TabModule,
    SpanRequestDetailModule,
    SpanResponseDetailModule,
    SpanTagsDetailModule,
    ButtonModule,
    TooltipModule,
    IconModule,
    ToggleButtonModule,
    LabelModule,
    JsonViewerModule,
    LoadAsyncModule,
    ListViewModule,
    SpanDetailTitleHeaderModule,
    SpanExitCallsModule,
    LogEventsTableModule,
    ToggleGroupModule,
    MessageDisplayModule,
    CopyToClipboardModule,
    MemoizeModule,
  ],
  declarations: [SpanDetailComponent],
  exports: [SpanDetailComponent],
})
export class SpanDetailModule {}
