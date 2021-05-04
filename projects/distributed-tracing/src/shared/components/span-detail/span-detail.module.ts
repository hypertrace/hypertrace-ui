import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ButtonModule,
  IconModule,
  JsonViewerModule,
  LabelModule,
  ListViewModule,
  LoadAsyncModule,
  TabModule,
  ToggleButtonModule,
  TooltipModule
} from '@hypertrace/components';
import { SpanExitCallsModule } from './exit-calls/span-exit-calls.module';
import { SpanDetailTitleHeaderModule } from './headers/title/span-detail-title-header.module';
import { SpanLogEventsModule } from './log-events/span-log-events.module';
import { SpanRequestDetailModule } from './request/span-request-detail.module';
import { SpanResponseDetailModule } from './response/span-response-detail.module';
import { SpanDetailComponent } from './span-detail.component';
import { SpanTagsDetailModule } from './tags/span-tags-detail.module';

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
    SpanLogEventsModule
  ],
  declarations: [SpanDetailComponent],
  exports: [SpanDetailComponent]
})
export class SpanDetailModule {}
