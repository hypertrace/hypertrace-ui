import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../../button/button.module';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
import { IconModule } from '../../icon/icon.module';
import { PopoverModule } from '../../popover/popover.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { TableEditColumnsModalComponent } from './table-edit-columns-modal.component';

@NgModule({
  imports: [CommonModule, IconModule, PopoverModule, TraceCheckboxModule, ButtonModule, TooltipModule],
  exports: [TableEditColumnsModalComponent],
  declarations: [TableEditColumnsModalComponent]
})
export class TableColumnsModule {}
