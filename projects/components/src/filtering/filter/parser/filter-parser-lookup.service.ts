import { Injectable } from '@angular/core';
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
      throw new Error(`Filter parser not found for operator '${operator}'`);
    }

    return filterParser;
  }

  public isSupportedOperator(operator: FilterOperator): boolean {
    try {
      this.lookup(operator);

      return true;
    } catch (e) {
      return false;
    }
  }
}
