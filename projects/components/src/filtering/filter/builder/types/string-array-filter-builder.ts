import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringArrayFilterBuilder extends AbstractFilterBuilder<string> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.StringArray;
  }

  public supportedTopLevelOperators(): FilterOperator[] {
    return [FilterOperator.In];
  }

  public supportedSubpathOperators(): FilterOperator[] {
    return [];
  }

  protected buildValueString(value: string | string[]): string {
    return String(value);
  }
}
