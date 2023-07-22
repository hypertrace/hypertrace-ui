import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringMapFilterBuilder extends AbstractFilterBuilder<string> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.StringMap;
  }

  public supportedTopLevelOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.NotContainsKey, FilterOperator.ContainsKeyLike];
  }

  public supportedSubpathOperators(): FilterOperator[] {
    return [
      FilterOperator.Equals,
      FilterOperator.NotEquals,
      FilterOperator.In,
      FilterOperator.NotIn,
      FilterOperator.Like
    ];
  }

  protected buildValueString(value: string): string {
    return String(value);
  }
}
