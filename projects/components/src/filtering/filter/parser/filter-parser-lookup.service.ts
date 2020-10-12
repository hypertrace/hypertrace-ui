import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { FilterAttributeType } from '../filter-attribute-type';
import { FilterOperator } from '../filter-operators';
import { AbstractFilterParser } from './types/abstract-filter-parser';
import { ComparisonFilterParser } from './types/comparison-filter-parser';
import { ContainsFilterParser } from './types/contains-filter-parser';
import { InFilterParser } from './types/in-filter-parser';

@Injectable({
  providedIn: 'root'
})
export class FilterParserLookupService {
  public lookup(operator: FilterOperator): AbstractFilterParser<unknown> {
    switch (operator) {
      case FilterOperator.Equals:
      case FilterOperator.NotEquals:
      case FilterOperator.LessThan:
      case FilterOperator.LessThanOrEqualTo:
      case FilterOperator.GreaterThan:
      case FilterOperator.GreaterThanOrEqualTo:
        return new ComparisonFilterParser();
      case FilterOperator.In:
        return new InFilterParser();
      case FilterOperator.ContainsKey:
      case FilterOperator.ContainsKeyValue:
        return new ContainsFilterParser();
      default:
        assertUnreachable(operator);
    }

    throw new Error(`Filter parser not found for operator '${operator}'.`);
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
