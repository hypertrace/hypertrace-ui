import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringArrayFilterBuilder extends AbstractFilterBuilder<string[]> {
  private static readonly DELIMITER: string = ',';

  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.String;
  }

  protected supportedOperators(): FilterOperator[] {
    return [FilterOperator.In];
  }

  protected convertValueToString(value: string[]): string {
    return value.join(StringArrayFilterBuilder.DELIMITER);
  }
}
