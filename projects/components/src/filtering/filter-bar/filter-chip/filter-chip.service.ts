import { Injectable } from '@angular/core';
import { FilterBuilderLookupService } from '../../filter/builder/filter-builder-lookup.service';
import { AbstractFilterBuilder } from '../../filter/builder/types/abstract-filter-builder';
import { IncompleteFilter } from '../../filter/filter';
import { FilterAttribute } from '../../filter/filter-attribute';
import { FilterOperator } from '../../filter/filter-operators';
import { FilterParserLookupService } from '../../filter/parser/filter-parser-lookup.service';
import { SplitFilter } from '../../filter/parser/parsed-filter';
import { AbstractFilterParser, splitFilterStringByOperator } from '../../filter/parser/types/abstract-filter-parser';

@Injectable({
  providedIn: 'root'
})
export class FilterChipService {
  public constructor(
    private readonly filterBuilderLookupService: FilterBuilderLookupService,
    private readonly filterParserLookupService: FilterParserLookupService
  ) {}

  public autocompleteFilters(attributes: FilterAttribute[], text: string = ''): IncompleteFilter[] {
    return attributes
      .filter(attribute => this.filterBuilderLookupService.isBuildableType(attribute.type))
      .flatMap(attribute => this.autocompleteFilter(attribute, text))
      .filter(incompleteFilter => this.filterMatchesUserText(text, incompleteFilter));
  }

  private filterMatchesUserText(text: string, incompleteFilter: IncompleteFilter): boolean {
    const isStringMatch = incompleteFilter.userString.toLowerCase().includes(text.trim().toLowerCase());

    if (isStringMatch || incompleteFilter.operator === undefined) {
      return isStringMatch;
    }

    /*
     * In most cases, the isStringMatch should be the only check that is needed, however this check fails for
     * STRING_MAP types with an operator since the LHS includes a user entered key between the attribute name
     * and the operator. We fix this by sending the full string through our parsing logic to see if we can pull
     * the key value off the LHS and build a filter out of it. If so, its a valid match and we want to include
     * it as an autocomplete option.
     */

    const isCompleteFilter =
      this.filterParserLookupService
        .lookup(incompleteFilter.operator)
        .parseFilterString(incompleteFilter.metadata, incompleteFilter.userString) !== undefined;

    return isCompleteFilter || isStringMatch;
  }

  private autocompleteFilter(attribute: FilterAttribute, text: string): IncompleteFilter[] {
    const filterBuilder = this.filterBuilderLookupService.lookup(attribute.type);

    // Check for operator

    const splitFilter = splitFilterStringByOperator(filterBuilder.supportedOperators(), text, true);

    if (splitFilter === undefined) {
      // Unable to find operator
      return this.autocompleteWithoutOperator(filterBuilder, attribute, text);
    }

    // Operator found

    const filterParser = this.filterParserLookupService.lookup(splitFilter.operator);

    return this.autocompleteWithOperator(filterBuilder, filterParser, splitFilter, attribute, text);
  }

  private autocompleteWithoutOperator(
    filterBuilder: AbstractFilterBuilder<unknown>,
    attribute: FilterAttribute,
    text: string
  ): IncompleteFilter[] {
    if (text.toLowerCase().includes(attribute.displayName.toLowerCase()) && text.endsWith(' ')) {
      // Attribute found, but no operator or value so let's provide all operator options for autocomplete

      return filterBuilder.supportedOperators().map(operator => {
        const filterParser = this.filterParserLookupService.lookup(operator);

        const splitFilter = splitFilterStringByOperator([operator], `${text} ${operator} `);
        const value = splitFilter === undefined ? undefined : filterParser.parseValueString(attribute, splitFilter);

        return {
          metadata: attribute,
          field: attribute.name,
          operator: operator,
          userString: filterBuilder.buildUserFilterString(attribute, operator, value)
        };
      });
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
}
