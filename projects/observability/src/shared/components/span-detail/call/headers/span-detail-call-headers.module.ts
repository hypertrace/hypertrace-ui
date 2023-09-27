import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MemoizeModule } from '@hypertrace/common';
import { LabelModule, ListViewModule, LoadAsyncModule, TooltipModule } from '@hypertrace/components';
import { SpanDetailCallHeadersComponent } from './span-detail-call-headers.component';
import { ExploreFilterLinkModule } from '../../../explore-filter-link/explore-filter-link.module';

@NgModule({
  imports: [
    CommonModule,
    LabelModule,
    ListViewModule,
    LoadAsyncModule,
    ExploreFilterLinkModule,
    MemoizeModule,
    TooltipModule
  ],
  declarations: [SpanDetailCallHeadersComponent],
  exports: [SpanDetailCallHeadersComponent]
})
export class SpanDetailCallHeadersModule {}
