import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { FilterParser } from '../filter-parser.decorator';
import { AbstractFilterParser } from './abstract-filter-parser';

@FilterParser({
  supportedAttributeTypes: [FilterAttributeType.StringMap],
  supportedOperators: [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue]
})
export class MapFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  private static readonly DELIMITER: string = ':';

  protected supportedAttributeTypes(): FilterAttributeType[] {
    return MapFilterParser.supportedAttributeTypes;
  }

  protected supportedOperators(): FilterOperator[] {
    return MapFilterParser.supportedOperators;
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
    return valueString.split(MapFilterParser.DELIMITER).map(String);
  }
}

type PossibleValuesTypes = string[];
