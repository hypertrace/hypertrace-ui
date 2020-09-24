import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringMapFilterBuilder extends AbstractFilterBuilder<string[]> {
  private static readonly DELIMITER: string = ':';

  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.StringMap;
  }

  protected supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue];
  }

  protected convertValueToString(value: string[]): string {
    return value.join(StringMapFilterBuilder.DELIMITER);
  }
}
