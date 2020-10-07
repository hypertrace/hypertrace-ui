import { collapseWhitespace } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringMapFilterBuilder extends AbstractFilterBuilder<string | string[]> {
  private static readonly STRING_MAP_LHS_DELIMITER: string = '.';
  private static readonly STRING_MAP_RHS_DELIMITER: string = ':';

  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.StringMap;
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue];
  }

  protected buildValueString(value: string | string[]): string {
    return Array.isArray(value) ? value.join(StringMapFilterBuilder.STRING_MAP_RHS_DELIMITER) : value;
  }

  public buildUserFilterString(
    attribute: FilterAttribute,
    operator?: FilterOperator,
    value?: string | string[]
  ): string {
    const lhs = this.buildUserFilterStringLhs(attribute, operator, value);
    const rhs = this.buildUserFilterStringRhs(operator, value);

    return collapseWhitespace(`${lhs} ${operator ?? ''} ${rhs}`).trim();
  }

  private buildUserFilterStringLhs(
    attribute: FilterAttribute,
    operator?: FilterOperator,
    value?: string | string[]
  ): string {
    if (operator === FilterOperator.ContainsKey || operator === undefined || value === undefined) {
      return attribute.displayName;
    }

    return `${attribute.displayName}${StringMapFilterBuilder.STRING_MAP_LHS_DELIMITER}${
      Array.isArray(value) ? value[0] : value
    }`;
  }

  private buildUserFilterStringRhs(operator?: FilterOperator, value?: string | string[]): string {
    return Array.isArray(value) ? value[operator === FilterOperator.ContainsKey ? 0 : 1] ?? '' : value ?? '';
  }
}
