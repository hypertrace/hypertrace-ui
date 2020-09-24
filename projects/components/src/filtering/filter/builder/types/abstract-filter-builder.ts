import { collapseWhitespace } from '@hypertrace/common';
import { Filter } from '../../filter';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator, toUrlFilterOperator } from '../../filter-operators';

export abstract class AbstractFilterBuilder<TValue> {
  public static supportedAttributeTypes: FilterAttributeType[];
  public static supportedOperators: FilterOperator[];

  protected abstract supportedAttributeTypes(): FilterAttributeType[];
  protected abstract supportedOperators(): FilterOperator[];

  protected abstract convertValueToString(value: TValue): string;

  public buildFiltersForSupportedOperators(attribute: FilterAttribute, value: TValue): Filter<TValue>[] {
    return this.supportedOperators().map(operator => this.buildFilter(attribute, operator, value));
  }

  public buildFilter(attribute: FilterAttribute, operator: FilterOperator, value: TValue): Filter<TValue> {
    return {
      metadata: attribute,
      field: attribute.name,
      operator: operator,
      value: value,
      userString: this.buildUserFilterString(attribute, operator, value),
      urlString: this.buildUrlFilterString(attribute, operator, value)
    };
  }

  protected buildUserFilterString(attribute: FilterAttribute, operator: FilterOperator, value: TValue): string {
    return collapseWhitespace(`${attribute.displayName} ${operator} ${this.convertValueToString(value)}`).trim();
  }

  protected buildUrlFilterString(attribute: FilterAttribute, operator: FilterOperator, value: TValue): string {
    return encodeURIComponent(`${attribute.name}${toUrlFilterOperator(operator)}${this.convertValueToString(value)}`);
  }
}
