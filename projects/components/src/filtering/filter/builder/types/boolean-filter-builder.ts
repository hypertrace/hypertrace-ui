import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class BooleanFilterBuilder extends AbstractFilterBuilder<boolean> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.Boolean;
  }

  public supportedTopLevelOperators(): FilterOperator[] {
    return [FilterOperator.Equals, FilterOperator.NotEquals, FilterOperator.In];
  }

  public supportedSubpathOperators(): FilterOperator[] {
    return [];
  }

  protected buildValueString(value: boolean): string {
    return String(value);
  }
}
