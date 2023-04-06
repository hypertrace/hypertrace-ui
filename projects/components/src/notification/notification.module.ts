import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { IconModule } from '../icon/icon.module';
import { NotificationComponent } from './notification.component';

@NgModule({
  imports: [CommonModule, IconModule, MatSnackBarModule],
  declarations: [NotificationComponent],
  exports: [NotificationComponent]
})
export class NotificationModule {}
