import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { DividerModule } from '../divider/divider.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { PopoverModule } from '../popover/popover.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { MultiSelectComponent } from './multi-select.component';

@NgModule({
  imports: [
    CommonModule,
    IconModule,
    LabelModule,
    PopoverModule,
    DividerModule,
    TraceSearchBoxModule,
    ButtonModule,
    LoadAsyncModule
  ],
  declarations: [MultiSelectComponent],
  exports: [MultiSelectComponent]
})
export class MultiSelectModule {}
