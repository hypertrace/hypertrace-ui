import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalModule } from '../modal/modal.module';
import { SheetOverlayModule } from './sheet/sheet-overlay.module';
@NgModule({
  imports: [CommonModule, SheetOverlayModule, ModalModule] // TODO remove modal once callers migrated
})
export class OverlayModule {}
