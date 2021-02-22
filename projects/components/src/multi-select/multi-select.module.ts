import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DividerModule } from '../divider/divider.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LetAsyncModule } from '../let-async/let-async.module';
import { PopoverModule } from '../popover/popover.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { MultiSelectComponent } from './multi-select.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IconModule,
    LabelModule,
    LetAsyncModule,
    PopoverModule,
    DividerModule,
    TraceSearchBoxModule
  ],
  declarations: [MultiSelectComponent],
  exports: [MultiSelectComponent]
})
export class MultiSelectModule {}
