import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class NumberArrayFilterBuilder extends AbstractFilterBuilder<number[]> {
  private static readonly DELIMITER: string = ',';

  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.Number;
  }

  protected supportedOperators(): FilterOperator[] {
    return [FilterOperator.In];
  }

  protected convertValueToString(value: number[]): string {
    return String(value.join(NumberArrayFilterBuilder.DELIMITER));
  }
}
