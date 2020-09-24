import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringFilterBuilder extends AbstractFilterBuilder<string> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.String;
  }

  protected supportedOperators(): FilterOperator[] {
    return [FilterOperator.Equals, FilterOperator.NotEquals];
  }

  protected convertValueToString(value: string): string {
    return value;
  }
}
