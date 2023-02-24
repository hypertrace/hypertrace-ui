import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../../icon/icon.module';
import { PopoverModule } from '../../popover/popover.module';
import { FilterModule } from '../filter/filter.module';
import { FilterButtonComponent } from './filter-button.component';

@NgModule({
  imports: [CommonModule, IconModule, FilterModule, PopoverModule],
  exports: [FilterButtonComponent],
  declarations: [FilterButtonComponent]
})
export class FilterButtonModule {}
