import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../../button/button.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { ModalOverlayComponent } from './modal-overlay.component';
import { ModalService } from './modal-service';

@NgModule({
  providers: [ModalService],
  imports: [CommonModule, ButtonModule, TooltipModule],
  declarations: [ModalOverlayComponent],
  exports: [ModalOverlayComponent]
})
export class ModalOverlayModule {}
