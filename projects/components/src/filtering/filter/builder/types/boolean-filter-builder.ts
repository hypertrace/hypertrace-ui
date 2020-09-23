import { isBoolean } from 'lodash-es';
import { FilterOperator } from '../../filter-api';
import { FilterAttributeType } from '../../filter-attribute-type';
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

  public convertStringToValue(value: string): boolean | undefined {
    const val = Boolean(value);

    return isBoolean(val) ? val : undefined;
  }

  public convertValueToString(value: boolean): string {
    return String(value);
  }
}
