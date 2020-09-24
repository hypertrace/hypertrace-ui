import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { FilterBuilder } from '../filter-builder.decorator';
import { AbstractFilterBuilder } from './abstract-filter-builder';

@FilterBuilder({
  supportedAttributeTypes: [FilterAttributeType.String],
  supportedOperators: [FilterOperator.In]
})
export class StringArrayFilterBuilder extends AbstractFilterBuilder<string[]> {
  private static readonly DELIMITER: string = ',';

  public supportedAttributeTypes(): FilterAttributeType[] {
    return StringArrayFilterBuilder.supportedAttributeTypes;
  }

  public supportedOperators(): FilterOperator[] {
    return StringArrayFilterBuilder.supportedOperators;
  }

  public convertValueToString(value: string[]): string {
    return value.join(StringArrayFilterBuilder.DELIMITER);
  }
}
