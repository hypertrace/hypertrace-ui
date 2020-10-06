import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringMapFilterBuilder extends AbstractFilterBuilder<string | string[]> {
  private static readonly DELIMITER: string = ':';

  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.StringMap;
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue];
  }

  protected buildValueString(value: string | string[]): string {
    return Array.isArray(value) ? value.join(StringMapFilterBuilder.DELIMITER) : value;
  }
}
