import { collapseWhitespace } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterType } from '../../filter-type';
import {
  Filter,
  toUrlFilterOperator,
  toUserFilterOperator,
  UrlFilterOperator,
  UserFilterOperator
} from '../filter-api';

export abstract class AbstractFilterBuilder<T> {
  public abstract convertValue(value: unknown, operator?: UserFilterOperator): T;
  public abstract convertValueToString(value: unknown, operator?: UserFilterOperator): string;
  public abstract supportedValue(): FilterType;
  public abstract supportedOperators(): UserFilterOperator[];

  public buildFiltersForAvailableOperators(attribute: FilterAttribute, value?: T): Filter<T>[] {
    return this.supportedOperators().map(operator => this.buildFilter(attribute, operator, value));
  }

  public buildFilter(attribute: FilterAttribute, operator: UserFilterOperator, value?: T): Filter<T> {
    return {
      metadata: attribute,
      field: attribute.name,
      operator: operator,
      value: this.convertValue(value, operator),
      userString: this.buildUserFilterString(attribute, operator, value),
      urlString: this.buildUrlFilterString(attribute, toUrlFilterOperator(operator), value)
    };
  }

  public buildUserFilterString(attribute: FilterAttribute, operator?: UserFilterOperator, value?: unknown): string {
    return collapseWhitespace(
      `${attribute.displayName} ${operator !== undefined ? operator : ''} ${this.convertValueToString(value, operator)}`
    ).trim();
  }

  protected buildUrlFilterString(attribute: FilterAttribute, operator: UrlFilterOperator, value: unknown): string {
    return encodeURIComponent(
      `${attribute.name}${operator}${this.convertValueToString(value, toUserFilterOperator(operator))}`
    );
  }
}
