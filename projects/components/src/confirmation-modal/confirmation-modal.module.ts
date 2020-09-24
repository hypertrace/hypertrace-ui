import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { ButtonModule } from '../button/button.module';
import { LabelModule } from '../label/label.module';

@NgModule({
  declarations: [ConfirmationModalComponent],
  imports: [CommonModule, ButtonModule, LabelModule]
})
export class ConfirmationModalModule {}
