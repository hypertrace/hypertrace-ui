import { collapseWhitespace } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { Filter, FilterValue, IncompleteFilter } from '../../filter';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { MAP_LHS_DELIMITER } from '../../filter-delimiters';
import { FilterOperator, toUrlFilterOperator } from '../../filter-operators';
import { FilterAttributeExpression } from '../../parser/parsed-filter';

export abstract class AbstractFilterBuilder<TValue extends FilterValue> {
  public abstract supportedAttributeType(): FilterAttributeType;

  public abstract supportedSubpathOperators(): FilterOperator[];
  public abstract supportedTopLevelOperators(): FilterOperator[];

  protected abstract buildValueString(value: TValue): string;

  public allSupportedOperators(): FilterOperator[] {
    return [...this.supportedTopLevelOperators(), ...this.supportedSubpathOperators()];
  }

  public buildFiltersForSupportedOperators(attribute: FilterAttribute, value: TValue): Filter<TValue>[] {
    return this.supportedTopLevelOperators().map(operator => this.buildFilter(attribute, operator, value));
  }

  public buildFilter(
    attribute: FilterAttribute,
    operator: FilterOperator,
    value: TValue,
    subpath?: string
  ): Filter<TValue> {
    if (
      (isEmpty(subpath) && !this.supportedTopLevelOperators().includes(operator)) ||
      (!isEmpty(subpath) && !this.supportedSubpathOperators().includes(operator))
    ) {
      throw Error(`Operator '${operator}' not supported for filter attribute type '${attribute.type}'`);
    }

    return {
      metadata: attribute,
      field: attribute.name,
      subpath: subpath,
      operator: operator,
      value: value,
      userString: this.buildUserFilterString(attribute, subpath, operator, value),
      urlString: this.buildUrlFilterString(attribute, subpath, operator, value)
    };
  }

  public buildPartialFilter(
    attribute: FilterAttribute,
    operator?: FilterOperator,
    value?: TValue,
    subpath?: string
  ): IncompleteFilter<TValue> {
    if (
      operator !== undefined &&
      ((isEmpty(subpath) && !this.supportedTopLevelOperators().includes(operator)) ||
        (!isEmpty(subpath) && !this.supportedSubpathOperators().includes(operator)))
    ) {
      throw Error(`Operator '${operator}' not supported for filter attribute type '${attribute.type}'`);
    }

    return {
      metadata: attribute,
      field: attribute.name,
      subpath: subpath,
      operator: operator,
      value: value,
      userString: this.buildUserFilterString(attribute, subpath, operator, value)
    };
  }

  public buildUserFilterString(
    attribute: FilterAttribute,
    subpath?: string,
    operator?: FilterOperator,
    value?: TValue
  ): string {
    const attributeString = this.buildAttributeExpressionString(attribute.displayName, subpath);

    return collapseWhitespace(
      `${attributeString} ${operator ?? ''} ${value !== undefined ? this.buildValueString(value) : ''}`
    ).trim();
  }

  public buildUserStringWithMatchingWhitespace(
    userEnteredString: string,
    attributeExpression: FilterAttributeExpression,
    operator: FilterOperator
  ): string {
    const attributeString = this.buildAttributeExpressionString(
      attributeExpression.attribute.displayName,
      attributeExpression.subpath
    );
    const userStringAfterAttributeExpression = userEnteredString.slice(attributeString.length);
    const whitespace =
      userStringAfterAttributeExpression.length === 0
        ? ' '
        : userStringAfterAttributeExpression.match(/(\s*)/)?.[0] ?? '';

    return `${attributeString}${whitespace}${operator}`;
  }

  protected buildUrlFilterString(
    attribute: FilterAttribute,
    subpath: string | undefined,
    operator: FilterOperator,
    value: TValue
  ): string {
    const attributeString = this.buildAttributeExpressionString(attribute.name, subpath);

    return encodeURIComponent(`${attributeString}${toUrlFilterOperator(operator)}${this.buildValueString(value)}`);
  }

  private buildAttributeExpressionString(attributeString: string, subpath?: string): string {
    return isEmpty(subpath) ? attributeString : `${attributeString}${MAP_LHS_DELIMITER}${subpath}`;
  }
}
