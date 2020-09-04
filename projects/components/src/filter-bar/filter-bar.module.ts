import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { ComboBoxModule } from '../combo-box/combo-box.module';
import { IconModule } from '../icon/icon.module';
import { FilterBarComponent } from './filter-bar.component';
import { FilterBuilderConstructor, FILTER_BUILDERS } from './filter/builder/filter-builder';
import { FilterBuilderService } from './filter/builder/filter-builder.service';
import { NumberFilterBuilder } from './filter/builder/number-filter-builder';
import { StringArrayFilterBuilder } from './filter/builder/string-array-filter-builder';
import { StringFilterBuilder } from './filter/builder/string-filter-builder';
import { FilterComponent } from './filter/filter.component';

@NgModule({
  imports: [CommonModule, IconModule, ButtonModule, ComboBoxModule],
  exports: [FilterBarComponent],
  declarations: [FilterBarComponent, FilterComponent],
  providers: [
    {
      provide: FILTER_BUILDERS,
      useValue: [NumberFilterBuilder, StringFilterBuilder, StringArrayFilterBuilder]
    }
  ]
})
export class FilterBarModule {
  public constructor(
    @Inject(FILTER_BUILDERS) filterBuilders: FilterBuilderConstructor<unknown>[],
    filterBuilderService: FilterBuilderService
  ) {
    filterBuilderService.registerAll(filterBuilders);
  }
}
