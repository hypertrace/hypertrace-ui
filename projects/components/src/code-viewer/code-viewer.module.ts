import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DownloadFileModule } from '../download-file/download-file.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { CodeViewerComponent } from './code-viewer.component';

@NgModule({
  imports: [CommonModule, DownloadFileModule, TraceSearchBoxModule],
  declarations: [CodeViewerComponent],
  exports: [CodeViewerComponent]
})
export class CodeViewerModule {}
