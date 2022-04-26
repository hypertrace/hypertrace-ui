import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CopyToClipboardModule } from '../../copy-to-clipboard/copy-to-clipboard.module';
import { DownloadFileModule } from '../../download-file/download-file.module';
import { MessageDisplayModule } from '../../message-display/message-display.module';
import { TraceSearchBoxModule } from '../../search-box/search-box.module';
import { CodeViewerComponent } from './code-viewer.component';

@NgModule({
  imports: [CommonModule, CopyToClipboardModule, DownloadFileModule, MessageDisplayModule, TraceSearchBoxModule],
  declarations: [CodeViewerComponent],
  exports: [CodeViewerComponent]
})
export class CodeViewerModule {}
