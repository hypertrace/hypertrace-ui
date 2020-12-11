import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { FormattingModule } from '@hypertrace/common';

@NgModule({
  declarations: [ConfirmationModalComponent],
  imports: [CommonModule, ButtonModule, FormattingModule]
})
export class ConfirmationModule {}
