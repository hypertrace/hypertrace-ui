import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
import { IconModule } from '../../icon/icon.module';
import { PopoverModule } from '../../popover/popover.module';
import { FilterBuilderConstructor, FILTER_BUILDERS } from '../filter/builder/filter-builder';
import { FilterBuilderLookupService } from '../filter/builder/filter-builder.service';
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
    filterBuilderService: FilterBuilderLookupService
  ) {
    filterBuilderService.registerAll(filterBuilders);
  }
}
