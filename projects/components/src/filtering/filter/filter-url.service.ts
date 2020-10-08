import { Injectable } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterBuilderLookupService } from './builder/filter-builder-lookup.service';
import { Filter, IncompleteFilter } from './filter';
import { FilterAttribute } from './filter-attribute';
import { fromUrlFilterOperator, toUrlFilterOperator } from './filter-operators';
import { FilterParserLookupService } from './parser/filter-parser-lookup.service';
import { splitFilterStringByOperator } from './parser/types/abstract-filter-parser';

@Injectable({
  providedIn: 'root'
})
export class FilterUrlService {
  private static readonly FILTER_QUERY_PARAM: string = 'filter';

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService,
    private readonly filterParserLookupService: FilterParserLookupService
  ) {}

  public getUrlFiltersChanges$(attributes: FilterAttribute[]): Observable<Filter[]> {
    return this.navigationService.navigation$.pipe(map(() => this.getUrlFilters(attributes)));
  }

  public getUrlFilters(attributes: FilterAttribute[]): Filter[] {
    return this.navigationService
      .getAllValuesForQueryParameter(FilterUrlService.FILTER_QUERY_PARAM)
      .map(filterString => this.parseUrlFilterString(attributes, filterString))
      .filter((filter): filter is Filter => filter !== undefined);
  }

  public setUrlFilters(filters: Filter[]): void {
    this.navigationService.addQueryParametersToUrl({
      [FilterUrlService.FILTER_QUERY_PARAM]: filters.length === 0 ? undefined : filters.map(f => f.urlString)
    });
  }

  public addUrlFilter(attributes: FilterAttribute[], filter: Filter): void {
    const filterParser = this.filterParserLookupService.lookup(filter.operator);

    const urlFilters = this.getUrlFilters(attributes);
    const otherFilters = urlFilters.filter(f => f.field !== filter.field);

    const remainingFiltersForAttribute = urlFilters
      .filter(f => f.field === filter.field)
      .filter(f => !filterParser.conflictingOperators(filter.operator).includes(f.operator));

    this.setUrlFilters([...otherFilters, ...remainingFiltersForAttribute, filter]);
  }

  public removeUrlFilter(attributes: FilterAttribute[], filter: IncompleteFilter): void {
    const urlFilters = this.getUrlFilters(attributes);
    const remainingFilters = urlFilters.filter(f => {
      const matchField = f.field === filter.field;
      const matchOperator = filter.operator === undefined || f.operator === filter.operator;
      const matchValue = filter.value === undefined || f.value === filter.value;

      return !(matchField && matchOperator && matchValue);
    });

    this.setUrlFilters([...remainingFilters]);
  }

  private parseUrlFilterString(attributes: FilterAttribute[], filterString: string): Filter | undefined {
    return attributes
      .filter(attribute => this.filterBuilderLookupService.isBuildableType(attribute.type))
      .flatMap(attribute => {
        const filterBuilder = this.filterBuilderLookupService.lookup(attribute.type);
        const supportedUrlOperators = filterBuilder.supportedOperators().map(toUrlFilterOperator);

        const splitUrlFilter = splitFilterStringByOperator(supportedUrlOperators, filterString, false);

        if (splitUrlFilter === undefined) {
          return undefined;
        }

        const filterParser = this.filterParserLookupService.lookup(fromUrlFilterOperator(splitUrlFilter.operator));

        const parsedFilter = filterParser.parseUrlFilterString(attribute, filterString);

        if (parsedFilter === undefined) {
          return undefined;
        }

        return splitUrlFilter.lhs === parsedFilter.field
          ? filterBuilder.buildFilter(attribute, parsedFilter.operator, parsedFilter.value)
          : undefined;
      })
      .find(splitFilter => splitFilter !== undefined);
  }
}
