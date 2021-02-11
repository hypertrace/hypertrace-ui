import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DividerModule } from '../divider/divider.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LetAsyncModule } from '../let-async/let-async.module';
import { PopoverModule } from '../popover/popover.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SelectControlOptionComponent } from './select-control-option.component';
import { SelectGroupComponent } from './select-group.component';
import { SelectOptionComponent } from './select-option.component';
import { SelectComponent } from './select.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IconModule,
    LabelModule,
    LetAsyncModule,
    PopoverModule,
    TooltipModule,
    DividerModule
  ],
  declarations: [SelectComponent, SelectOptionComponent, SelectGroupComponent, SelectControlOptionComponent],
  exports: [SelectComponent, SelectOptionComponent, SelectGroupComponent, SelectControlOptionComponent]
})
export class SelectModule {}
