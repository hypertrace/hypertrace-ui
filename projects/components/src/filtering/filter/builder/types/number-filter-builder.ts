import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { FilterBuilder } from '../filter-builder.decorator';
import { AbstractFilterBuilder } from './abstract-filter-builder';

@FilterBuilder({
  supportedAttributeTypes: [FilterAttributeType.Number],
  supportedOperators: [
    FilterOperator.Equals,
    FilterOperator.NotEquals,
    FilterOperator.LessThan,
    FilterOperator.LessThanOrEqualTo,
    FilterOperator.GreaterThan,
    FilterOperator.GreaterThanOrEqualTo
  ]
})
export class NumberFilterBuilder extends AbstractFilterBuilder<number> {
  public supportedAttributeTypes(): FilterAttributeType[] {
    return NumberFilterBuilder.supportedAttributeTypes;
  }

  public supportedOperators(): FilterOperator[] {
    return NumberFilterBuilder.supportedOperators;
  }

  public convertValueToString(value: number): string {
    return String(value);
  }
}
