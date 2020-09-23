import { FilterOperator } from '../../../filter-api';
import { FilterAttributeType } from '../../../filter-attribute-type';
import { FilterBuilder } from '../filter-builder.decorator';
import { AbstractFilterBuilder } from './abstract-filter-builder';

@FilterBuilder({
  supportedAttributeTypes: [FilterAttributeType.String],
  supportedOperators: [FilterOperator.Equals, FilterOperator.NotEquals]
})
export class StringFilterBuilder extends AbstractFilterBuilder<string> {
  public supportedAttributeTypes(): FilterAttributeType[] {
    return StringFilterBuilder.supportedAttributeTypes;
  }

  public supportedOperators(): FilterOperator[] {
    return StringFilterBuilder.supportedOperators;
  }

  public convertStringToValue(value: string): string | undefined {
    return value;
  }

  public convertValueToString(value: string): string {
    return value;
  }
}
