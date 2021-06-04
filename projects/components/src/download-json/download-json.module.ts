import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { NotificationModule } from '../notification/notification.module';
import { DownloadJsonComponent } from './download-json.component';

@NgModule({
  declarations: [DownloadJsonComponent],
  imports: [CommonModule, ButtonModule, NotificationModule, IconModule],
  exports: [DownloadJsonComponent]
})
export class DownloadJsonModule {}
