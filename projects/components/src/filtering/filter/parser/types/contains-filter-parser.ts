import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { SplitFilter } from '../parsed-filter';
import { AbstractFilterParser } from './abstract-filter-parser';

export class ContainsFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  private static readonly CONTAINS_DELIMITER: string = ':';

  public supportedAttributeTypes(): FilterAttributeType[] {
    return [FilterAttributeType.StringMap];
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue];
  }

  protected parseValueString(
    attribute: FilterAttribute,
    splitFilter: SplitFilter<FilterOperator>
  ): PossibleValuesTypes | undefined {
    switch (attribute.type) {
      case FilterAttributeType.StringMap:
        return this.parseStringMapValue(splitFilter.rhs);
      case FilterAttributeType.Number: // Unsupported
      case FilterAttributeType.Boolean: // Unsupported
      case FilterAttributeType.String: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        return undefined;
      default:
        assertUnreachable(attribute.type);
    }
  }

  private parseStringMapValue(valueString: string): string[] {
    return valueString.split(ContainsFilterParser.CONTAINS_DELIMITER).map(String);
  }
}

type PossibleValuesTypes = string[];
