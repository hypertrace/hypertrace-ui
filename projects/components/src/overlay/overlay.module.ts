import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalOverlayModule } from './modal/modal-overlay.module';
import { SheetOverlayModule } from './sheet/sheet-overlay.module';
@NgModule({
  imports: [CommonModule, SheetOverlayModule, ModalOverlayModule]
})
export class OverlayModule {}
