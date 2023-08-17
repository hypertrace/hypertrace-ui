import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterButtonModule } from '@hypertrace/components';
import { FilterButtonWrapperComponent } from './filter-button-wrapper.component';

@NgModule({
  declarations: [FilterButtonWrapperComponent],
  imports: [CommonModule, FilterButtonModule],
  exports: [FilterButtonWrapperComponent]
})
export class FilterButtonWrapperModule {}
