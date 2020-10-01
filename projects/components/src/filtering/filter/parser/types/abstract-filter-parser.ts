import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator, fromUrlFilterOperator, toUrlFilterOperator } from '../../filter-operators';
import { ParsedFilter, SplitFilter } from '../parsed-filter';

export abstract class AbstractFilterParser<TValue> {
  public abstract supportedAttributeTypes(): FilterAttributeType[];
  public abstract supportedOperators(): FilterOperator[];

  protected abstract parseValueString(attribute: FilterAttribute, valueString: string): TValue | undefined;

  public parseFilterString(attribute: FilterAttribute, filterString: string): ParsedFilter<TValue> | undefined {
    const splitFilter = AbstractFilterParser.splitFilterStringByOperator(this.supportedOperators(), filterString, true);

    if (splitFilter === undefined) {
      // Unable to split on operator
      return undefined;
    }

    if (attribute.displayName.toLowerCase() !== splitFilter.lhs.toLowerCase()) {
      // TODO: lhs parsing for new Tag dot syntax
      // Unable to parse attribute from lhs
      return undefined;
    }

    const parsedValue = this.parseValueString(attribute, splitFilter.rhs);

    if (parsedValue === undefined) {
      // Unable to parse value from rhs
      return undefined;
    }

    // Successfully parsed filter

    return {
      field: attribute.name,
      operator: splitFilter.operator,
      value: parsedValue
    };
  }

  public parseUrlFilterString(attribute: FilterAttribute, urlFilterString: string): ParsedFilter<TValue> | undefined {
    const filterString = decodeURIComponent(urlFilterString);

    const splitUrlFilter = AbstractFilterParser.splitFilterStringByOperator(
      this.supportedOperators().map(toUrlFilterOperator),
      filterString,
      false
    );

    if (splitUrlFilter === undefined) {
      // Unable to split on operator
      return undefined;
    }

    if (attribute.name.toLowerCase() !== splitUrlFilter.lhs.toLowerCase()) {
      // TODO: lhs parsing for new Tag dot syntax
      // Unable to parse attribute from lhs
      return undefined;
    }

    const parsedValue = this.parseValueString(attribute, splitUrlFilter.rhs);

    if (parsedValue === undefined) {
      // Unable to parse value from rhs
      return undefined;
    }

    // Successfully parsed URL filter

    return {
      field: attribute.name,
      operator: fromUrlFilterOperator(splitUrlFilter.operator),
      value: parsedValue
    };
  }

  public static splitFilterStringByOperator<TOperator extends string>(
    possibleOperators: TOperator[],
    filterString: string,
    expectSpaceAroundOperator: boolean = true
  ): SplitFilter<TOperator> | undefined {
    const matchingOperator = possibleOperators
      .sort((o1: string, o2: string) => o2.length - o1.length) // Sort by length to check multichar ops first
      .map(op => (expectSpaceAroundOperator ? ` ${op as string} ` : op))
      .find(op => filterString.includes(op));

    if (matchingOperator === undefined) {
      return undefined;
    }

    const parts = filterString.split(matchingOperator).map(str => str.trim());

    return {
      lhs: parts[0],
      operator: matchingOperator.trim() as TOperator,
      rhs: parts[1]
    };
  }
}
