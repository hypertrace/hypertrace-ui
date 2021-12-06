import { collapseWhitespace } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { MAP_LHS_DELIMITER, MAP_RHS_DELIMITER } from '../../filter-delimiters';
import { FilterOperator } from '../../filter-operators';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringMapFilterBuilder extends AbstractFilterBuilder<string | [string, string]> {
  public supportedAttributeType(): FilterAttributeType {
    return FilterAttributeType.StringMap;
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue];
  }

  protected buildValueString(value: string | [string, string]): string {
    return Array.isArray(value) ? value.join(MAP_RHS_DELIMITER) : value;
  }

  public buildUserFilterString(
    attribute: FilterAttribute,
    operator?: FilterOperator,
    value?: string | [string, string]
  ): string {
    const lhs = this.buildUserFilterStringLhs(attribute, operator, value);
    const rhs = this.buildUserFilterStringRhs(operator, value);

    return collapseWhitespace(`${lhs} ${operator ?? ''} ${rhs}`).trim();
  }

  private buildUserFilterStringLhs(
    attribute: FilterAttribute,
    operator?: FilterOperator,
    value?: string | [string, string]
  ): string {
    if (operator === FilterOperator.ContainsKey || operator === undefined || value === undefined) {
      return attribute.displayName;
    }

    const displayValue: string = Array.isArray(value) ? (value.length > 0 ? value[0] : '') : value;

    return `${attribute.displayName}${MAP_LHS_DELIMITER}${displayValue}`;
  }

  private buildUserFilterStringRhs(operator?: FilterOperator, value?: string | string[]): string {
    return operator === FilterOperator.ContainsKey
      ? Array.isArray(value)
        ? value[0] ?? ''
        : value ?? ''
      : Array.isArray(value)
      ? value[1] ?? ''
      : value ?? '';
  }
}
