import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { PopoverModule } from '../popover/popover.module';
import { CopyToClipboardComponent } from './copy-to-clipboard.component';

@NgModule({
  imports: [CommonModule, IconModule, PopoverModule, ButtonModule],
  declarations: [CopyToClipboardComponent],
  exports: [CopyToClipboardComponent]
})
export class CopyToClipboardModule {}
