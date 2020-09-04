import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CopyToClipboardModule } from '../copy-to-clipboard/copy-to-clipboard.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { CopyShareableLinkToClipboardComponent } from './copy-shareable-link-to-clipboard.component';

@NgModule({
  imports: [CommonModule, CopyToClipboardModule, TooltipModule],
  declarations: [CopyShareableLinkToClipboardComponent],
  exports: [CopyShareableLinkToClipboardComponent]
})
export class CopyShareableLinkToClipboardModule {}
