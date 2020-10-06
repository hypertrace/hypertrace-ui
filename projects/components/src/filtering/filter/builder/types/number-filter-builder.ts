import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class NumberFilterBuilder extends AbstractFilterBuilder<number | number[]> {
  private static readonly DELIMITER: string = ',';

  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.Number;
  }

  public supportedOperators(): FilterOperator[] {
    return [
      FilterOperator.Equals,
      FilterOperator.NotEquals,
      FilterOperator.LessThan,
      FilterOperator.LessThanOrEqualTo,
      FilterOperator.GreaterThan,
      FilterOperator.GreaterThanOrEqualTo,
      FilterOperator.In
    ];
  }

  protected buildValueString(value: number | number[]): string {
    return Array.isArray(value) ? String(value.join(`${NumberFilterBuilder.DELIMITER} `).trim()) : String(value);
  }
}
