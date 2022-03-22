import { Injectable } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { isEmpty, remove } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterBuilderLookupService } from './builder/filter-builder-lookup.service';
import { areCompatibleFilters, Filter, IncompleteFilter } from './filter';
import { FilterAttribute } from './filter-attribute';
import { fromUrlFilterOperator, toUrlFilterOperator } from './filter-operators';
import { FilterParserLookupService } from './parser/filter-parser-lookup.service';
import { splitFilterStringByOperator } from './parser/parsed-filter';

@Injectable({
  providedIn: 'root'
})
export class FilterUrlService {
  private static readonly FILTER_QUERY_PARAM: string = 'filter';
  private static readonly GROUP_BY_QUERY_PARAM: string = 'group-by';

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService,
    private readonly filterParserLookupService: FilterParserLookupService
  ) {}

  public getUrlFilteringStateChanges$(attributes: FilterAttribute[]): Observable<UrlFilteringState> {
    return this.navigationService.navigation$.pipe(map(() => this.getUrlFilteringState(attributes)));
  }

  public getUrlFilteringState(attributes: FilterAttribute[]): UrlFilteringState {
    const attributeMap = new Map(attributes.map(attribute => [attribute.name, attribute]));

    return {
      filters: this.getUrlFilters(attributes),
      groupBy: this.getUrlGroupBy()
        .map(attributeName => attributeMap.get(attributeName))
        .filter((attribute): attribute is FilterAttribute => attribute !== undefined)
    };
  }

  public setUrlFiltersAndGroupBy(filters: Filter[], groupBy: FilterAttribute[]): void {
    this.navigationService.addQueryParametersToUrl({
      [FilterUrlService.FILTER_QUERY_PARAM]: filters.length === 0 ? undefined : filters.map(f => f.urlString),
      [FilterUrlService.GROUP_BY_QUERY_PARAM]: isEmpty(groupBy) ? undefined : [groupBy.map(g => g.name).toString()]
    });
  }

  public getUrlFiltersChanges$(attributes: FilterAttribute[]): Observable<Filter[]> {
    return this.navigationService.navigation$.pipe(map(() => this.getUrlFilters(attributes)));
  }

  public getUrlFiltersForAttributes(attributes: FilterAttribute[]): (Filter | IncompleteFilter)[] {
    const urlFilters = this.getUrlFilters(attributes);

    return attributes.map(attribute => {
      const match = urlFilters.find(f => f.field === attribute.name);
      if (match !== undefined) {
        remove(urlFilters, f => f === match);

        return match;
      }

      return this.filterBuilderLookupService.lookup(attribute.type).buildPartialFilter(attribute);
    });
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

  public setUrlGroupBy(groupBy?: string[]): void {
    this.navigationService.addQueryParametersToUrl({
      [FilterUrlService.GROUP_BY_QUERY_PARAM]: isEmpty(groupBy) ? undefined : [groupBy!.toString()]
    });
  }

  public getUrlGroupBy(): string[] {
    return this.navigationService
      .getAllValuesForQueryParameter(FilterUrlService.GROUP_BY_QUERY_PARAM)
      .map(groupByString => groupByString.split(',').map(attributeName => attributeName.trim()))
      .flat();
  }

  public addUrlFilter(attributes: FilterAttribute[], filter: Filter): void {
    const remainingFilters = this.getUrlFilters(attributes).filter(f => areCompatibleFilters(f, filter));

    this.setUrlFilters([...remainingFilters, filter]);
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
        const supportedUrlOperators = filterBuilder.allSupportedOperators().map(toUrlFilterOperator);

        const splitUrlFilter = splitFilterStringByOperator(
          attribute,
          supportedUrlOperators,
          decodeURIComponent(filterString)
        );

        if (splitUrlFilter === undefined) {
          return undefined;
        }

        const convertedOperator = fromUrlFilterOperator(splitUrlFilter.operator);

        const parsedFilter = this.filterParserLookupService.lookup(convertedOperator).parseSplitFilter({
          ...splitUrlFilter,
          operator: convertedOperator
        });

        return (
          parsedFilter &&
          filterBuilder.buildFilter(attribute, parsedFilter.operator, parsedFilter.value, parsedFilter.subpath)
        );
      })
      .find(splitFilter => splitFilter !== undefined);
  }
}

export interface UrlFilteringState {
  filters: Filter[];
  groupBy: FilterAttribute[];
}
