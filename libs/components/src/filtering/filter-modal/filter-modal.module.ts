import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../../button/button.module';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
import { IconModule } from '../../icon/icon.module';
import { PopoverModule } from '../../popover/popover.module';
import { FilterModule } from '../filter/filter.module';
import { InFilterModalComponent } from './in-filter-modal.component';

@NgModule({
  imports: [CommonModule, IconModule, PopoverModule, TraceCheckboxModule, FilterModule, ButtonModule],
  exports: [InFilterModalComponent],
  declarations: [InFilterModalComponent]
})
export class FilterModalModule {}
