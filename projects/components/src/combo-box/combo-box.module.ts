import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormattingModule } from '@hypertrace/common';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { PopoverModule } from '../popover/popover.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { ComboBoxComponent } from './combo-box.component';

@NgModule({
  imports: [CommonModule, PopoverModule, IconModule, FormsModule, FormattingModule, ButtonModule, TooltipModule],
  declarations: [ComboBoxComponent],
  exports: [ComboBoxComponent]
})
export class ComboBoxModule {}
