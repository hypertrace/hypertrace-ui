import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { TraceCheckboxModule } from '../checkbox/checkbox.module';
import { FilterBuilderConstructor, FILTER_BUILDERS } from '../filter-bar/filter/builder/filter-builder';
import { FilterBuilderService } from '../filter-bar/filter/builder/filter-builder.service';
import { IconModule } from '../icon/icon.module';
import { PopoverModule } from '../popover/popover.module';
import { FilterButtonComponent } from './filter-button.component';
import { InFilterButtonComponent } from './in-filter-button.component';

@NgModule({
  imports: [CommonModule, IconModule, PopoverModule, TraceCheckboxModule],
  exports: [FilterButtonComponent, InFilterButtonComponent],
  declarations: [FilterButtonComponent, InFilterButtonComponent]
})
export class FilterButtonModule {
  public constructor(
    @Inject(FILTER_BUILDERS) filterBuilders: FilterBuilderConstructor<unknown>[],
    filterBuilderService: FilterBuilderService
  ) {
    filterBuilderService.registerAll(filterBuilders);
  }
}
