import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash-es';
import { FilterBuilderLookupService } from '../../filter/builder/filter-builder-lookup.service';
import { AbstractFilterBuilder } from '../../filter/builder/types/abstract-filter-builder';
import { IncompleteFilter } from '../../filter/filter';
import { FilterAttribute } from '../../filter/filter-attribute';
import { FilterOperator } from '../../filter/filter-operators';
import { FilterParserLookupService } from '../../filter/parser/filter-parser-lookup.service';
import {
  FilterAttributeExpression,
  SplitFilter,
  splitFilterStringByOperator,
  tryParseStringForAttribute
} from '../../filter/parser/parsed-filter';
import { AbstractFilterParser } from '../../filter/parser/types/abstract-filter-parser';
import { FilterValue } from './../../filter/filter';

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
      .flatMap(attribute => this.buildIncompleteFilters(attribute, text));
  }

  private buildIncompleteFilters(attribute: FilterAttribute, text: string): IncompleteFilter[] {
    const filterBuilder = this.filterBuilderLookupService.lookup(attribute.type);
    const splitFilter = splitFilterStringByOperator(attribute, filterBuilder.allSupportedOperators(), text);
    // If we've got a split filter we've got both an attribute and operator
    if (splitFilter) {
      return [
        this.buildIncompleteFilterForAttributeAndOperator(
          filterBuilder,
          this.filterParserLookupService.lookup(splitFilter.operator),
          splitFilter,
          text
        )
      ];
    }

    // Next, look to see if this string starts with the attribute. If it does, continue on to see which operators also match the string.
    const attributeExpression = tryParseStringForAttribute(attribute, text);
    if (attributeExpression) {
      return this.buildIncompleteFiltersForAttribute(text, filterBuilder, attributeExpression);
    }

    // We can't figure out the attribute. If the partial string it could later match, present this attribute
    if (this.isPartialAttributeMatch(text, attribute)) {
      return [this.buildIncompleteFilterForPartialAttributeMatch(filterBuilder, attribute)];
    }

    // Not even a partial match, present no options
    return [];
  }

  private buildIncompleteFiltersForAttribute(
    text: string,
    filterBuilder: AbstractFilterBuilder<FilterValue>,
    attributeExpression: FilterAttributeExpression
  ): IncompleteFilter[] {
    const topLevelOperatorFilters = filterBuilder.supportedTopLevelOperators().map(operator => ({
      metadata: attributeExpression.attribute,
      field: attributeExpression.attribute.name,
      operator: operator,
      userString: filterBuilder.buildUserStringWithMatchingWhitespace(
        text,
        { attribute: attributeExpression.attribute },
        operator
      )
    }));

    // Subpath operators should add a subpath placeholder to the user string
    const subpathOperatorFilters = filterBuilder.supportedSubpathOperators().map(operator => ({
      metadata: attributeExpression.attribute,
      field: attributeExpression.attribute.name,
      subpath: attributeExpression.subpath,
      operator: operator,
      userString: filterBuilder.buildUserStringWithMatchingWhitespace(
        text,
        {
          attribute: attributeExpression.attribute,
          subpath: isEmpty(attributeExpression.subpath) ? 'example' : attributeExpression.subpath
        },
        operator
      )
    }));

    return [...topLevelOperatorFilters, ...subpathOperatorFilters];
  }

  private buildIncompleteFilterForAttributeAndOperator(
    filterBuilder: AbstractFilterBuilder<FilterValue>,
    filterParser: AbstractFilterParser<FilterValue>,
    splitFilter: SplitFilter<FilterOperator>,
    text: string
  ): IncompleteFilter {
    // Check for complete filter

    const parsedFilter = filterParser.parseSplitFilter(splitFilter);

    if (parsedFilter !== undefined) {
      // Found complete filter - <attribute> <operator> <value>

      return {
        ...filterBuilder.buildFilter(
          splitFilter.attribute,
          parsedFilter.operator,
          parsedFilter.value,
          parsedFilter.subpath
        ),
        userString: text // Use the actual text provided by user, so it matches their input
      };
    }

    // Not a complete filter, but we know we have attribute and operator - <attribute> <operator>
    return {
      metadata: splitFilter.attribute,
      field: splitFilter.attribute.name,
      operator: splitFilter.operator,
      userString: text // Use the actual text provided by user, so it matches their input
    };
  }

  private isPartialAttributeMatch(text: string, attribute: FilterAttribute): boolean {
    return attribute.displayName.toLowerCase().includes(text.toLowerCase());
  }

  private buildIncompleteFilterForPartialAttributeMatch(
    filterBuilder: AbstractFilterBuilder<FilterValue>,
    attribute: FilterAttribute
  ): IncompleteFilter {
    return {
      metadata: attribute,
      field: attribute.name,
      userString: filterBuilder.buildUserFilterString(attribute)
    };
  }
}
