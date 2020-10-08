import { collapseWhitespace } from '@hypertrace/common';
import { Filter } from '../../filter';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator, toUrlFilterOperator } from '../../filter-operators';

export abstract class AbstractFilterBuilder<TValue> {
  public abstract supportedAttributeType(): FilterAttributeType;
  public abstract supportedOperators(): FilterOperator[];

  protected abstract buildValueString(value: TValue): string;

  public buildFiltersForSupportedOperators(attribute: FilterAttribute, value: TValue): Filter<TValue>[] {
    return this.supportedOperators().map(operator => this.buildFilter(attribute, operator, value));
  }

  public buildFilter(attribute: FilterAttribute, operator: FilterOperator, value: TValue): Filter<TValue> {
    if (!this.supportedOperators().includes(operator)) {
      throw Error(`Operator '${operator}' not supported for filter attribute type '${attribute.type}'`);
    }

    return {
      metadata: attribute,
      field: attribute.name,
      operator: operator,
      value: value,
      userString: this.buildUserFilterString(attribute, operator, value),
      urlString: this.buildUrlFilterString(attribute, operator, value)
    };
  }

  public buildUserFilterString(attribute: FilterAttribute, operator?: FilterOperator, value?: TValue): string {
    return collapseWhitespace(
      `${attribute.displayName} ${operator ?? ''} ${value !== undefined ? this.buildValueString(value) : ''}`
    ).trim();
  }

  protected buildUrlFilterString(attribute: FilterAttribute, operator: FilterOperator, value: TValue): string {
    return encodeURIComponent(`${attribute.name}${toUrlFilterOperator(operator)}${this.buildValueString(value)}`);
  }
}
