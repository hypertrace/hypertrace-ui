import { assertUnreachable } from '@hypertrace/common';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { SplitFilter } from '../parsed-filter';
import { AbstractFilterParser } from './abstract-filter-parser';

export class ContainsFilterParser extends AbstractFilterParser<string> {
  public supportedAttributeTypes(): FilterAttributeType[] {
    return [FilterAttributeType.StringMap];
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey];
  }

  public parseValueString(splitFilter: SplitFilter<FilterOperator>): string | undefined {
    switch (splitFilter.attribute.type) {
      case FilterAttributeType.StringMap:
        return String(splitFilter.rhs);
      case FilterAttributeType.StringArray: // Unsupported
      case FilterAttributeType.Number: // Unsupported
      case FilterAttributeType.Boolean: // Unsupported
      case FilterAttributeType.String: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        return undefined;
      default:
        return assertUnreachable(splitFilter.attribute.type);
    }
  }
}
