import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../../button/button.module';
import { CopyToClipboardModule } from '../../copy-to-clipboard/copy-to-clipboard.module';
import { DownloadFileModule } from '../../download-file/download-file.module';
import { InfoIconModule } from '../../info-icon/info-icon.module';
import { MessageDisplayModule } from '../../message-display/message-display.module';
import { TraceSearchBoxModule } from '../../search-box/search-box.module';
import { CodeViewerComponent } from './code-viewer.component';

@NgModule({
  imports: [
    ButtonModule,
    CommonModule,
    CopyToClipboardModule,
    DownloadFileModule,
    InfoIconModule,
    MessageDisplayModule,
    TraceSearchBoxModule
  ],
  declarations: [CodeViewerComponent],
  exports: [CodeViewerComponent]
})
export class CodeViewerModule {}
