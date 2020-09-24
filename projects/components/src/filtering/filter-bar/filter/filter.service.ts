import { Injectable } from '@angular/core';
import { FilterAttribute } from '../filter-attribute';
import { FilterBuilderLookupService } from '../../filter/builder/filter-builder.service';
import { UserFilterOperator, USER_FILTER_OPERATORS } from './filter-api';
import { FilterParserLookupService } from '../../filter/parser/filter-parser.service';

export interface IncompleteFilter {
  metadata: FilterAttribute;
  field: string;
  operator?: UserFilterOperator;
  value?: unknown;
  userString: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public constructor(
    private readonly filterBuilderService: FilterBuilderLookupService,
    private readonly filterParserService: FilterParserLookupService
  ) {}

  public lookupAvailableMatchingFilters(attributes: FilterAttribute[], text: string = ''): IncompleteFilter[] {
    return this.filterByText(text, this.mapToFilters(text, this.filterByType(attributes)));
  }

  private filterByType(attributes: FilterAttribute[]): FilterAttribute[] {
    return attributes.filter(attribute => this.filterBuilderService.isSupportedType(attribute));
  }

  private filterByText(text: string, filters: IncompleteFilter[]): IncompleteFilter[] {
    return filters.filter(
      filter =>
        this.parseUserInput(text, filter.metadata) !== undefined ||
        filter.userString.toLowerCase().includes(text.toLowerCase())
    );
  }

  private mapToFilters(text: string, attributes: FilterAttribute[]): IncompleteFilter[] {
    return attributes.flatMap(attribute => {
      const filterBuilder = this.filterBuilderService.lookup(attribute);

      const filter = this.parseUserInput(text, attribute);
      if (filter === undefined) {
        // This means user text does not include a full field yet, so just return all attributes that matched
        return {
          metadata: attribute,
          field: attribute.name,
          userString: this.filterBuilderService.lookup(attribute).buildUserFilterString(attribute)
        };
      }

      if (filter.operator !== undefined) {
        // This means we have a partially built filter, including at least an operator and maybe value
        return filterBuilder.buildFilter(attribute, filter.operator, filter.value);
      }

      // Only have a match for the field, so build options for each possible operator
      return filterBuilder.buildFiltersForAvailableOperators(attribute);
    });
  }

  private parseUserInput(text: string, attribute: FilterAttribute): IncompleteFilter | undefined {
    // First check to see if we have a complete filter string
    const filter = this.filterParserService.parseUserFilterString(text, attribute);

    if (filter !== undefined) {
      // Full filter with key, operator, and value found
      return filter;
    }

    /*
     * Not a complete filter string, so let's see how much we do have
     */

    const operator = USER_FILTER_OPERATORS.find(op => this.textIsOnlyFieldAndOperator(text, attribute, op) ?? op);

    if (operator !== undefined) {
      // Partial filter with key and operator found
      return {
        metadata: attribute,
        field: attribute.name,
        operator: operator,
        userString: this.filterBuilderService.lookup(attribute).buildUserFilterString(attribute, operator)
      };
    }

    if (this.textIsOnlyField(text, attribute)) {
      // Partial filter with only key found
      return {
        metadata: attribute,
        field: attribute.name,
        userString: this.filterBuilderService.lookup(attribute).buildUserFilterString(attribute)
      };
    }

    return undefined;
  }

  private textIsOnlyField(text: string, attribute: FilterAttribute): boolean {
    return text.trim().toLowerCase() === attribute.displayName.toLowerCase();
  }

  private textIsOnlyFieldAndOperator(text: string, attribute: FilterAttribute, operator: UserFilterOperator): boolean {
    const filterBuilder = this.filterBuilderService.lookup(attribute);

    return text.trim().toLowerCase() === filterBuilder.buildFilter(attribute, operator).userString.toLowerCase();
  }
}
