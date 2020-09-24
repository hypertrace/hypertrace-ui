import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { FilterBuilder } from '../filter-builder.decorator';
import { AbstractFilterBuilder } from './abstract-filter-builder';

@FilterBuilder({
  supportedAttributeTypes: [FilterAttributeType.Boolean],
  supportedOperators: [FilterOperator.Equals, FilterOperator.NotEquals]
})
export class BooleanFilterBuilder extends AbstractFilterBuilder<boolean> {
  public supportedAttributeTypes(): FilterAttributeType[] {
    return BooleanFilterBuilder.supportedAttributeTypes;
  }

  public supportedOperators(): FilterOperator[] {
    return BooleanFilterBuilder.supportedOperators;
  }

  public convertValueToString(value: boolean): string {
    return String(value);
  }
}
