import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
import { IconModule } from '../../icon/icon.module';
import { PopoverModule } from '../../popover/popover.module';
import { FilterModule } from '../filter/filter.module';
import { FilterButtonComponent } from './filter-button.component';
import { InFilterButtonComponent } from './in-filter-button.component';

@NgModule({
  imports: [CommonModule, IconModule, PopoverModule, TraceCheckboxModule, FilterModule],
  exports: [FilterButtonComponent, InFilterButtonComponent],
  declarations: [FilterButtonComponent, InFilterButtonComponent]
})
export class FilterButtonModule {}
