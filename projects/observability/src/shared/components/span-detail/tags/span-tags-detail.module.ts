import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LabelModule, ListViewModule, LoadAsyncModule, TooltipModule } from '@hypertrace/components';
import { ExploreFilterLinkModule } from '../../explore-filter-link/explore-filter-link.module';
import { SpanTagsDetailComponent } from './span-tags-detail.component';

@NgModule({
  imports: [CommonModule, ExploreFilterLinkModule, ListViewModule, LabelModule, LoadAsyncModule, TooltipModule],
  declarations: [SpanTagsDetailComponent],
  exports: [SpanTagsDetailComponent]
})
export class SpanTagsDetailModule {}
