import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
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

  public convertValueToString(value: number[]): string {
    return String(value.join(NumberArrayFilterBuilder.DELIMITER));
  }
}
