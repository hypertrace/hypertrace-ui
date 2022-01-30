import { assertUnreachable } from '@hypertrace/common';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { SplitFilter } from '../parsed-filter';
import { AbstractFilterParser } from './abstract-filter-parser';

export class ComparisonFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  public supportedAttributeTypes(): FilterAttributeType[] {
    return [
      FilterAttributeType.Boolean,
      FilterAttributeType.Number,
      FilterAttributeType.String,
      FilterAttributeType.StringMap
    ];
  }

  public supportedOperators(): FilterOperator[] {
    return [
      FilterOperator.Equals,
      FilterOperator.NotEquals,
      FilterOperator.LessThan,
      FilterOperator.LessThanOrEqualTo,
      FilterOperator.GreaterThan,
      FilterOperator.GreaterThanOrEqualTo,
      FilterOperator.Like
    ];
  }

  public parseValueString(splitFilter: SplitFilter<FilterOperator>): PossibleValuesTypes | undefined {
    switch (splitFilter.attribute.type) {
      case FilterAttributeType.Boolean:
        return this.parseBooleanValue(splitFilter.rhs);
      case FilterAttributeType.Number:
        return this.parseNumberValue(splitFilter.rhs);
      case FilterAttributeType.String:
      case FilterAttributeType.StringMap:
        return this.parseStringValue(splitFilter.rhs);
      case FilterAttributeType.StringArray: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        return undefined;
      default:
        return assertUnreachable(splitFilter.attribute.type);
    }
  }

  private parseBooleanValue(valueString: string): boolean | undefined {
    switch (valueString.toLowerCase()) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return undefined;
    }
  }

  private parseNumberValue(valueString: string): number | undefined {
    const val = valueString === '' ? NaN : Number(valueString);

    return isNaN(val) ? undefined : val;
  }

  private parseStringValue(valueString: string): string {
    return String(valueString);
  }
}

type PossibleValuesTypes = string | number | boolean;
