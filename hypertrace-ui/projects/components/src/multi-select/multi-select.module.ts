import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { DividerModule } from '../divider/divider.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { PopoverModule } from '../popover/popover.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { XMoreModule } from '../x-more/x-more.module';
import { MultiSelectComponent } from './multi-select.component';
import { IsEmptyPipeModule } from '@hypertrace/common';

@NgModule({
  imports: [
    CommonModule,
    IconModule,
    LabelModule,
    PopoverModule,
    DividerModule,
    TraceSearchBoxModule,
    ButtonModule,
    LoadAsyncModule,
    CheckboxModule,
    TooltipModule,
    XMoreModule,
    IsEmptyPipeModule,
  ],
  declarations: [MultiSelectComponent],
  exports: [MultiSelectComponent],
})
export class MultiSelectModule {}
