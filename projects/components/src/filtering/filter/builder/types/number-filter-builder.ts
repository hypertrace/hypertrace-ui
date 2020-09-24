import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class NumberFilterBuilder extends AbstractFilterBuilder<number> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.Number;
  }

  protected supportedOperators(): FilterOperator[] {
    return [
      FilterOperator.Equals,
      FilterOperator.NotEquals,
      FilterOperator.LessThan,
      FilterOperator.LessThanOrEqualTo,
      FilterOperator.GreaterThan,
      FilterOperator.GreaterThanOrEqualTo
    ];
  }

  protected convertValueToString(value: number): string {
    return String(value);
  }
}
