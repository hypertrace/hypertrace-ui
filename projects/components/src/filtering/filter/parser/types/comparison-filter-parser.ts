import { assertUnreachable } from '@hypertrace/common';
import { isBoolean } from 'lodash-es';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterParser } from './abstract-filter-parser';

export class ComparisonFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  protected supportedAttributeTypes(): FilterAttributeType[] {
    return [FilterAttributeType.Boolean, FilterAttributeType.Number, FilterAttributeType.String];
  }

  public supportedOperators(): FilterOperator[] {
    return [
      FilterOperator.Equals,
      FilterOperator.NotEquals,
      FilterOperator.LessThan,
      FilterOperator.LessThanOrEqualTo,
      FilterOperator.GreaterThan,
      FilterOperator.GreaterThanOrEqualTo
    ];
  }

  protected parseValueString(attribute: FilterAttribute, valueString: string): PossibleValuesTypes | undefined {
    switch (attribute.type) {
      case FilterAttributeType.Boolean:
        return this.parseBooleanValue(valueString);
      case FilterAttributeType.Number:
        return this.parseNumberValue(valueString);
      case FilterAttributeType.String:
        return this.parseStringValue(valueString);
      case FilterAttributeType.StringMap: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        return undefined;
      default:
        assertUnreachable(attribute.type);
    }
  }

  private parseBooleanValue(valueString: string): boolean | undefined {
    const val = Boolean(valueString);

    return isBoolean(val) ? val : undefined;
  }

  private parseNumberValue(valueString: string): number | undefined {
    const val = Number(valueString);

    return isNaN(val) ? undefined : val;
  }

  private parseStringValue(valueString: string): string {
    return String(valueString);
  }
}

type PossibleValuesTypes = string | number | boolean;
