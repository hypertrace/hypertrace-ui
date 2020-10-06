import { collapseWhitespace } from '@hypertrace/common';
import { Filter, FilterOperator, toUrlFilterOperator } from '../../filter-api';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';

export abstract class AbstractFilterBuilder<TValue> {
  public static supportedAttributeTypes: FilterAttributeType[];
  public static supportedOperators: FilterOperator[];

  protected abstract supportedAttributeTypes(): FilterAttributeType[];
  protected abstract supportedOperators(): FilterOperator[];

  protected abstract convertStringToValue(value: string): TValue | undefined;
  protected abstract convertValueToString(value: TValue): string;

  public buildFilters(attribute: FilterAttribute, value: TValue): Filter<TValue>[] {
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
