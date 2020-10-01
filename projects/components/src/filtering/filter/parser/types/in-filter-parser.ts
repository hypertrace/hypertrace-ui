import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterParser } from './abstract-filter-parser';

export class InFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  private static readonly DELIMITER: string = ',';

  public supportedAttributeTypes(): FilterAttributeType[] {
    return [FilterAttributeType.String, FilterAttributeType.Number];
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.In];
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
    return valueString.split(InFilterParser.DELIMITER).map(str => str.trim());
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
