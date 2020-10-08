import { Injectable } from '@angular/core';
import { FilterAttributeType } from '../filter-attribute-type';
import { FilterOperator } from '../filter-operators';
import { FilterParserConstructor } from './filter-parser-injection-token';
import { AbstractFilterParser } from './types/abstract-filter-parser';

@Injectable({
  providedIn: 'root'
})
export class FilterParserLookupService {
  private readonly filterParsers: Map<FilterOperator, AbstractFilterParser<unknown>> = new Map();

  public registerAll(filterParserConstructors: FilterParserConstructor<unknown>[]): void {
    filterParserConstructors.forEach(filterParserConstructor => {
      const filterParser = new filterParserConstructor();

      filterParser.supportedOperators().forEach(op => this.filterParsers.set(op, filterParser));
    });
  }

  public lookup(operator: FilterOperator): AbstractFilterParser<unknown> {
    const filterParser = this.filterParsers.get(operator);

    if (filterParser === undefined) {
      throw new Error(`Filter parser not found for operator '${operator}'.
      Available parsers are '${String(Array.from(this.filterParsers.keys()))}'`);
    }

    return filterParser;
  }

  public isParsableOperatorForType(operator: FilterOperator, type: FilterAttributeType): boolean {
    // NOTE: Just because a type is parsable, does not mean the operator is supported for that type.
    try {
      const filterParser = this.lookup(operator);

      return filterParser.supportedAttributeTypes().includes(type);
    } catch (e) {
      return false;
    }
  }
}
