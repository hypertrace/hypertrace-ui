import { FilterAttributeType } from '../../filter-attribute-type';
import { ARRAY_DELIMITER } from '../../filter-delimiters';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class NumberFilterBuilder extends AbstractFilterBuilder<number | number[]> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.Number;
  }

  public supportedTopLevelOperators(): FilterOperator[] {
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

  public supportedSubpathOperators(): FilterOperator[] {
    return [];
  }

  protected buildValueString(value: number | number[]): string {
    return Array.isArray(value) ? String(value.join(`${ARRAY_DELIMITER} `).trim()) : String(value);
  }
}
