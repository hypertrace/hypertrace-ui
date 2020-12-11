import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { ButtonModule } from '../button/button.module';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@NgModule({
  declarations: [ConfirmationModalComponent],
  imports: [CommonModule, ButtonModule, FormattingModule]
})
export class ConfirmationModule {}
