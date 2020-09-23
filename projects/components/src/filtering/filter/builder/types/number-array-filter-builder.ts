import { FilterOperator } from '../../filter-api';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterBuilder } from '../filter-builder.decorator';
import { AbstractFilterBuilder } from './abstract-filter-builder';

@FilterBuilder({
  supportedAttributeTypes: [FilterAttributeType.Number],
  supportedOperators: [FilterOperator.In]
})
export class NumberArrayFilterBuilder extends AbstractFilterBuilder<number[]> {
  private static readonly DELIMITER: string = ',';

  public supportedAttributeTypes(): FilterAttributeType[] {
    return NumberArrayFilterBuilder.supportedAttributeTypes;
  }

  public supportedOperators(): FilterOperator[] {
    return NumberArrayFilterBuilder.supportedOperators;
  }

  public convertStringToValue(value: string): number[] | undefined {
    const array = value.split(NumberArrayFilterBuilder.DELIMITER).map(str => {
      const val = Number(str.trim());

      return isNaN(val) ? undefined : val;
    });

    return array.includes(undefined) ? undefined : (array as number[]);
  }

  public convertValueToString(value: number[]): string {
    return String(value.join(NumberArrayFilterBuilder.DELIMITER));
  }
}
