import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringFilterBuilder extends AbstractFilterBuilder<string | string[]> {
  private static readonly STRING_DELIMITER: string = ',';

  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.String;
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.Equals, FilterOperator.NotEquals, FilterOperator.In];
  }

  protected buildValueString(value: string | string[]): string {
    return Array.isArray(value) ? value.join(`${StringFilterBuilder.STRING_DELIMITER} `).trim() : value;
  }
}
