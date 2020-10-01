import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterParser } from './abstract-filter-parser';

export class ContainsFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  private static readonly DELIMITER: string = ':';

  public supportedAttributeTypes(): FilterAttributeType[] {
    return [FilterAttributeType.StringMap];
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue];
  }

  protected parseValueString(attribute: FilterAttribute, valueString: string): PossibleValuesTypes | undefined {
    switch (attribute.type) {
      case FilterAttributeType.StringMap:
        return this.parseStringMapValue(valueString);
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
    return valueString.split(ContainsFilterParser.DELIMITER).map(String);
  }
}

type PossibleValuesTypes = string[];
