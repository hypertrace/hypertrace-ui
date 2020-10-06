import { FilterOperator } from '../../filter-api';
import { FilterAttributeType } from '../../filter-attribute-type';
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

  public convertStringToValue(value: string): string[] | undefined {
    return value.split(StringArrayFilterBuilder.DELIMITER);
  }

  public convertValueToString(value: string[]): string {
    return value.join(StringArrayFilterBuilder.DELIMITER);
  }
}
