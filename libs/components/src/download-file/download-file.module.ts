import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { DownloadFileComponent } from './download-file.component';

@NgModule({
  declarations: [DownloadFileComponent],
  imports: [CommonModule, ButtonModule, IconModule],
  exports: [DownloadFileComponent]
})
export class DownloadFileModule {}
