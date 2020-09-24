import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { FilterBuilderConstructor, FILTER_BUILDERS } from './builder/filter-builder-injection-token';
import { FilterBuilderLookupService } from './builder/filter-builder-lookup.service';
import { BooleanFilterBuilder } from './builder/types/boolean-filter-builder';
import { NumberArrayFilterBuilder } from './builder/types/number-array-filter-builder';
import { NumberFilterBuilder } from './builder/types/number-filter-builder';
import { StringArrayFilterBuilder } from './builder/types/string-array-filter-builder';
import { StringFilterBuilder } from './builder/types/string-filter-builder';
import { StringMapFilterBuilder } from './builder/types/string-map-filter-builder';
import { FilterParserConstructor, FILTER_PARSERS } from './parser/filter-parser-injection-token';
import { FilterParserLookupService } from './parser/filter-parser-lookup.service';
import { ComparisonFilterParser } from './parser/types/comparison-filter-parser';
import { ContainsFilterParser } from './parser/types/contains-filter-parser';
import { InFilterParser } from './parser/types/in-filter-parser';

@NgModule({
  imports: [CommonModule],
  exports: [],
  declarations: [],
  providers: [
    {
      provide: FILTER_BUILDERS,
      useValue: [
        BooleanFilterBuilder,
        NumberFilterBuilder,
        NumberArrayFilterBuilder,
        StringFilterBuilder,
        StringArrayFilterBuilder,
        StringMapFilterBuilder
      ]
    },
    {
      provide: FILTER_PARSERS,
      useValue: [ComparisonFilterParser, ContainsFilterParser, InFilterParser]
    }
  ]
})
export class FilterModule {
  public constructor(
    @Inject(FILTER_BUILDERS) filterBuilders: FilterBuilderConstructor<unknown>[],
    @Inject(FILTER_PARSERS) filterParsers: FilterParserConstructor<unknown>[],
    filterBuilderLookupService: FilterBuilderLookupService,
    filterParserLookupService: FilterParserLookupService
  ) {
    filterBuilderLookupService.registerAll(filterBuilders);
    filterParserLookupService.registerAll(filterParsers);
  }
}
