import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { FilterBuilder } from '../filter-builder.decorator';
import { AbstractFilterBuilder } from './abstract-filter-builder';

@FilterBuilder({
  supportedAttributeTypes: [FilterAttributeType.StringMap],
  supportedOperators: [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue]
})
export class StringMapFilterBuilder extends AbstractFilterBuilder<string[]> {
  private static readonly DELIMITER: string = ':';

  public supportedAttributeTypes(): FilterAttributeType[] {
    return StringMapFilterBuilder.supportedAttributeTypes;
  }

  public supportedOperators(): FilterOperator[] {
    return StringMapFilterBuilder.supportedOperators;
  }

  public convertValueToString(value: string[]): string {
    return value.join(StringMapFilterBuilder.DELIMITER);
  }
}
