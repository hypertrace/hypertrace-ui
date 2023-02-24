import { FilterAttributeType } from '../../filter-attribute-type';
import { ARRAY_DELIMITER } from '../../filter-delimiters';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringFilterBuilder extends AbstractFilterBuilder<string | string[]> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.String;
  }

  public supportedTopLevelOperators(): FilterOperator[] {
    return [
      FilterOperator.Equals,
      FilterOperator.NotEquals,
      FilterOperator.In,
      FilterOperator.NotIn,
      FilterOperator.Like,
      FilterOperator.Contains
    ];
  }

  public supportedSubpathOperators(): FilterOperator[] {
    return [];
  }

  protected buildValueString(value: string | string[]): string {
    return Array.isArray(value) ? value.join(`${ARRAY_DELIMITER} `).trim() : value;
  }
}
