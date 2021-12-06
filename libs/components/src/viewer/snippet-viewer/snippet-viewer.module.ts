import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CopyToClipboardModule } from '../../copy-to-clipboard/copy-to-clipboard.module';
import { SnippetViewerComponent } from './snippet-viewer.component';

@NgModule({
  declarations: [SnippetViewerComponent],
  imports: [CommonModule, CopyToClipboardModule],
  exports: [SnippetViewerComponent]
})
export class SnippetViewerModule {}
