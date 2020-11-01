import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { SnackbarComponent } from './snackbar.component';

@NgModule({
  imports: [CommonModule, IconModule, ButtonModule, MatSnackBarModule],
  declarations: [SnackbarComponent],
  exports: [SnackbarComponent]
})
export class SnackbarModule {}
