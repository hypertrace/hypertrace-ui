import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule, CopyShareableLinkToClipboardModule, TooltipModule } from '@hypertrace/components';
import { SpanDetailTitleHeaderComponent } from './span-detail-title-header.component';

@NgModule({
  imports: [CommonModule, TooltipModule, ButtonModule, CopyShareableLinkToClipboardModule],
  declarations: [SpanDetailTitleHeaderComponent],
  exports: [SpanDetailTitleHeaderComponent]
})
export class SpanDetailTitleHeaderModule {}
