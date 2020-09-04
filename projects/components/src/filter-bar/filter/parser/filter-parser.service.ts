import { Injectable } from '@angular/core';
import { FilterAttribute } from '../../filter-attribute';
import { FilterBuilderService } from '../builder/filter-builder.service';
import {
  Filter,
  toUserFilterOperator,
  UrlFilterOperator,
  URL_FILTER_OPERATORS,
  UserFilterOperator,
  USER_FILTER_OPERATORS
} from '../filter-api';

interface ParsedFilter {
  metadata: FilterAttribute;
  field: string;
  operator?: string;
  value?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class FilterParserService {
  public constructor(private readonly filterBuilderService: FilterBuilderService) {}

  public parseUserFilterString(filterString: string, attribute: FilterAttribute): Filter | undefined {
    const spacedOperators = USER_FILTER_OPERATORS.map(op => ` ${op} `);
    const parsed = this.parseFilterString(filterString, attribute, spacedOperators, attribute.displayName);

    if (parsed === undefined) {
      return undefined;
    }

    return this.filterBuilderService
      .lookup(attribute)
      .buildFilter(attribute, parsed.operator as UserFilterOperator, parsed.value);
  }

  public parseUrlFilterString(filterString: string, attributes: FilterAttribute[]): Filter | undefined {
    const possibleMatches = attributes.filter(attribute => filterString.startsWith(attribute.name));

    if (possibleMatches.length === 0) {
      return undefined;
    }

    const possibleFilters = possibleMatches
      .map(attr => {
        const parsed = this.parseFilterString(decodeURIComponent(filterString), attr, URL_FILTER_OPERATORS, attr.name);

        if (parsed === undefined) {
          return undefined;
        }

        return this.filterBuilderService
          .lookup(attr)
          .buildFilter(attr, toUserFilterOperator(parsed.operator as UrlFilterOperator), parsed.value);
      })
      .filter((parsedFilter): parsedFilter is Filter => parsedFilter !== undefined);

    return possibleFilters.length === 1 ? possibleFilters[0] : undefined;
  }

  private parseFilterString(
    filterString: string,
    attribute: FilterAttribute,
    availableOperators: string[],
    attributeMatchString: string
  ): ParsedFilter | undefined {
    const matchingOperator = availableOperators
      .sort((o1: string, o2: string) => o2.length - o1.length) // Check multichar ops first
      .find((operator: string) => filterString.includes(operator));

    if (matchingOperator === undefined) {
      return undefined;
    }

    const split = filterString.split(matchingOperator).map(t => t.trim());
    const parts = [split[0], matchingOperator, split[1]].filter((part: string | undefined) => (part ?? '').length > 0);

    if (parts.length < 3 || parts[0].trim().toLowerCase() !== attributeMatchString.toLowerCase()) {
      // Doesn't contain complete filter of key, op, and value OR is the wrong field
      return undefined;
    }

    return {
      metadata: attribute,
      field: attribute.name,
      operator: parts[1].trim(),
      value: parts[2].trim()
    };
  }
}
