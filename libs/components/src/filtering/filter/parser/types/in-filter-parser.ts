import { assertUnreachable } from '@hypertrace/common';
import { FilterAttributeType } from '../../filter-attribute-type';
import { ARRAY_DELIMITER } from '../../filter-delimiters';
import { FilterOperator } from '../../filter-operators';
import { SplitFilter } from '../parsed-filter';
import { AbstractFilterParser } from './abstract-filter-parser';

export class InFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  public supportedAttributeTypes(): FilterAttributeType[] {
    return [FilterAttributeType.String, FilterAttributeType.Number, FilterAttributeType.StringMap];
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.In];
  }

  public parseValueString(splitFilter: SplitFilter<FilterOperator>): PossibleValuesTypes | undefined {
    switch (splitFilter.attribute.type) {
      case FilterAttributeType.String:
      case FilterAttributeType.StringMap:
        return this.parseStringArrayValue(splitFilter.rhs);
      case FilterAttributeType.Number:
        return this.parseNumberArrayValue(splitFilter.rhs);
      case FilterAttributeType.Boolean: // Unsupported
      case FilterAttributeType.StringArray: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        return undefined;
      default:
        return assertUnreachable(splitFilter.attribute.type);
    }
  }

  private parseStringArrayValue(valueString: string): string[] {
    return valueString.split(ARRAY_DELIMITER).map(str => str.trim());
  }

  private parseNumberArrayValue(valueString: string): number[] | undefined {
    const array = valueString.split(ARRAY_DELIMITER).map(str => {
      const val = str.trim() === '' ? NaN : Number(str.trim());

      return isNaN(val) ? undefined : val;
    });

    return array.includes(undefined) ? undefined : (array as number[]);
  }
}

type PossibleValuesTypes = string[] | number[];
