import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { FilterParser } from '../filter-parser.decorator';
import { AbstractFilterParser } from './abstract-filter-parser';

@FilterParser({
  supportedAttributeTypes: [FilterAttributeType.String, FilterAttributeType.Number],
  supportedOperators: [FilterOperator.In]
})
export class InFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  private static readonly DELIMITER: string = ',';

  protected supportedAttributeTypes(): FilterAttributeType[] {
    return InFilterParser.supportedAttributeTypes;
  }

  protected supportedOperators(): FilterOperator[] {
    return InFilterParser.supportedOperators;
  }

  protected parseValueString(attribute: FilterAttribute, valueString: string): PossibleValuesTypes | undefined {
    switch (attribute.type) {
      case FilterAttributeType.String:
        return this.parseStringArrayValue(valueString);
      case FilterAttributeType.Number:
        return this.parseNumberArrayValue(valueString);
      case FilterAttributeType.Boolean: // Unsupported
      case FilterAttributeType.StringMap: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        return undefined;
      default:
        assertUnreachable(attribute.type);
    }
  }

  private parseStringArrayValue(valueString: string): string[] {
    return valueString.split(InFilterParser.DELIMITER).map(String);
  }

  private parseNumberArrayValue(valueString: string): number[] | undefined {
    const array = valueString.split(InFilterParser.DELIMITER).map(str => {
      const val = Number(str.trim());

      return isNaN(val) ? undefined : val;
    });

    return array.includes(undefined) ? undefined : (array as number[]);
  }
}

type PossibleValuesTypes = string[] | number[];
