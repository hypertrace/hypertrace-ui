import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { NotificationModule } from '../notification/notification.module';
import { DownloadFileComponent } from './download-file.component';

@NgModule({
  declarations: [DownloadFileComponent],
  imports: [CommonModule, ButtonModule, NotificationModule, IconModule],
  exports: [DownloadFileComponent]
})
export class DownloadFileModule {}
