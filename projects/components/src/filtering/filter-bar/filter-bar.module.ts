import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../../button/button.module';
import { ComboBoxModule } from '../../combo-box/combo-box.module';
import { IconModule } from '../../icon/icon.module';
import { FilterModule } from '../filter/filter.module';
import { FilterBarComponent } from './filter-bar.component';
import { FilterChipComponent } from './filter-chip/filter-chip.component';

@NgModule({
  imports: [CommonModule, IconModule, ButtonModule, ComboBoxModule, FilterModule],
  exports: [FilterBarComponent],
  declarations: [FilterBarComponent, FilterChipComponent]
})
export class FilterBarModule {}
