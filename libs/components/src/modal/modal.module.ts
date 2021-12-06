import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { ModalContainerComponent } from './modal-container.component';

@NgModule({
  imports: [CommonModule, ButtonModule, TooltipModule],
  declarations: [ModalContainerComponent],
  exports: [ModalContainerComponent]
})
export class ModalModule {}
