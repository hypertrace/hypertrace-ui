import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class BooleanFilterBuilder extends AbstractFilterBuilder<boolean> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.Boolean;
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.Equals, FilterOperator.NotEquals];
  }

  protected buildValueString(value: boolean): string {
    return String(value);
  }
}
