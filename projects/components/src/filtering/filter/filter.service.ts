import { Injectable } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterBuilderLookupService } from './builder/filter-builder-lookup.service';
import { AbstractFilterBuilder } from './builder/types/abstract-filter-builder';
import { Filter, IncompleteFilter } from './filter';
import { FilterAttribute } from './filter-attribute';
import { FilterOperator, fromUrlFilterOperator, toUrlFilterOperator } from './filter-operators';
import { FilterParserLookupService } from './parser/filter-parser-lookup.service';
import { SplitFilter } from './parser/parsed-filter';
import { AbstractFilterParser } from './parser/types/abstract-filter-parser';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private static readonly FILTER_QUERY_PARAM: string = 'filter';

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService,
    private readonly filterParserLookupService: FilterParserLookupService
  ) {}

  /*
   * URL Filtering
   */

  public getUrlFiltersChanges$(attributes: FilterAttribute[]): Observable<Filter[]> {
    return this.navigationService.navigation$.pipe(map(() => this.getUrlFilters(attributes)));
  }

  public getUrlFilters(attributes: FilterAttribute[]): Filter[] {
    return this.navigationService
      .getAllValuesForQueryParameter(FilterService.FILTER_QUERY_PARAM)
      .map(filterString => this.parseUrlFilterString(attributes, filterString))
      .filter((filter): filter is Filter => filter !== undefined);
  }

  public setUrlFilters(filters: Filter[]): void {
    this.navigationService.addQueryParametersToUrl({
      [FilterService.FILTER_QUERY_PARAM]: filters.length === 0 ? undefined : filters.map(f => f.urlString)
    });
  }

  public applyUrlFilter(attributes: FilterAttribute[], filter: Filter): void {
    const filters = this.getUrlFilters(attributes);

    const foundIndex = filters.findIndex(f => filter.field === f.field);

    if (foundIndex !== -1) {
      filters[foundIndex] = filter;
    } else {
      filters.push(filter);
    }

    this.setUrlFilters([...filters]);
  }

  public removeUrlFilter(attributes: FilterAttribute[], filter: Filter): void {
    this.setUrlFilters([...this.getUrlFilters(attributes).filter(f => filter.field !== f.field)]);
  }

  private parseUrlFilterString(attributes: FilterAttribute[], filterString: string): Filter | undefined {
    return attributes
      .filter(attribute => this.filterBuilderLookupService.isBuildableType(attribute.type))
      .flatMap(attribute => {
        const filterBuilder = this.filterBuilderLookupService.lookup(attribute.type);
        const supportedUrlOperators = filterBuilder.supportedOperators().map(toUrlFilterOperator);

        const splitUrlFilter = AbstractFilterParser.splitFilterStringByOperator(
          supportedUrlOperators,
          filterString,
          false
        );

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

  /*
   * Autocomplete
   */

  public autocompleteFilters(attributes: FilterAttribute[], text: string = ''): IncompleteFilter[] {
    return attributes
      .filter(attribute => this.filterBuilderLookupService.isBuildableType(attribute.type))
      .flatMap(attribute => this.autocompleteFilter(attribute, text))
      .filter(incompleteFilter => {
        const isStringMatch = incompleteFilter.userString.toLowerCase().includes(text.toLowerCase());

        if (incompleteFilter.operator === undefined) {
          return isStringMatch;
        }

        const isCompleteFilter =
          this.filterParserLookupService
            .lookup(incompleteFilter.operator)
            .parseFilterString(incompleteFilter.metadata, incompleteFilter.userString) !== undefined;

        return isCompleteFilter || isStringMatch;
      });
  }

  private autocompleteFilter(attribute: FilterAttribute, text: string): IncompleteFilter[] {
    const filterBuilder = this.filterBuilderLookupService.lookup(attribute.type);

    // Check for operator

    const splitFilter = AbstractFilterParser.splitFilterStringByOperator(
      filterBuilder.supportedOperators(),
      text,
      true
    );

    if (splitFilter === undefined) {
      // Unable to find operator
      return this.autocompleteWithoutOperator(filterBuilder, attribute, text);
    }

    // Operator found

    const filterParser = this.filterParserLookupService.lookup(splitFilter.operator);

    return this.autocompleteWithOperator(filterBuilder, filterParser, splitFilter, attribute, text);
  }

  private autocompleteWithOperator(
    filterBuilder: AbstractFilterBuilder<unknown>,
    filterParser: AbstractFilterParser<unknown>,
    splitFilter: SplitFilter<FilterOperator>,
    attribute: FilterAttribute,
    text: string
  ): IncompleteFilter[] {
    // Check for complete filter

    const parsedFilter = filterParser.parseFilterString(attribute, text);

    if (parsedFilter !== undefined) {
      // Found complete filter - <attribute> <operator> <value>

      return [filterBuilder.buildFilter(attribute, parsedFilter.operator, parsedFilter.value)];
    }

    // Not a complete filter, but we know we have an operator. Let's check if we also have an attribute

    if (splitFilter.lhs.trim().toLowerCase() === attribute.displayName.toLowerCase()) {
      // Attribute found, and we have the operator but we do not have a value (else it would have been complete)
      return [
        {
          metadata: attribute,
          field: attribute.name,
          operator: splitFilter.operator,
          userString: filterBuilder.buildUserFilterString(attribute, splitFilter.operator)
        }
      ];
    }

    // This attribute not found in text

    return [];
  }

  private autocompleteWithoutOperator(
    filterBuilder: AbstractFilterBuilder<unknown>,
    attribute: FilterAttribute,
    text: string
  ): IncompleteFilter[] {
    if (text.trim().toLowerCase() === attribute.displayName.toLowerCase()) {
      // Attribute found, but no operator or value so let's provide all operator options for autocomplete
      return filterBuilder.supportedOperators().map(operator => ({
        metadata: attribute,
        field: attribute.name,
        operator: operator,
        userString: filterBuilder.buildUserFilterString(attribute, operator)
      }));
    }

    // Nothing matching yet, so just provide the attribute for autocomplete

    return [
      {
        metadata: attribute,
        field: attribute.name,
        userString: filterBuilder.buildUserFilterString(attribute)
      }
    ];
  }
}
