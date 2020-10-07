import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator, fromUrlFilterOperator, toUrlFilterOperator, UrlFilterOperator } from '../../filter-operators';
import { ParsedFilter, SplitFilter } from '../parsed-filter';

export abstract class AbstractFilterParser<TValue> {
  public abstract supportedAttributeTypes(): FilterAttributeType[];
  public abstract supportedOperators(): FilterOperator[];

  public parseNameString(attribute: FilterAttribute, splitFilter: SplitFilter<FilterOperator>): string | undefined {
    return attribute.displayName.toLowerCase() !== splitFilter.lhs.toLowerCase() ? undefined : attribute.name;
  }

  public abstract parseValueString(
    attribute: FilterAttribute,
    splitFilter: SplitFilter<FilterOperator>
  ): TValue | undefined;

  public parseFilterString(attribute: FilterAttribute, filterString: string): ParsedFilter<TValue> | undefined {
    const splitFilter: SplitFilter<FilterOperator> | undefined = splitFilterStringByOperator(
      this.supportedOperators(),
      filterString,
      true
    );

    return splitFilter === undefined ? undefined : this.parseSplitFilter(attribute, splitFilter);
  }

  public parseUrlFilterString(attribute: FilterAttribute, urlFilterString: string): ParsedFilter<TValue> | undefined {
    const splitUrlFilter: SplitFilter<UrlFilterOperator> | undefined = splitFilterStringByOperator(
      this.supportedOperators().map(toUrlFilterOperator),
      decodeURIComponent(urlFilterString),
      false
    );

    return splitUrlFilter !== undefined
      ? this.parseSplitFilter(attribute, {
          lhs: attribute.displayName,
          operator: fromUrlFilterOperator(splitUrlFilter.operator),
          rhs: splitUrlFilter.rhs
        })
      : undefined;
  }

  private parseSplitFilter(
    attribute: FilterAttribute,
    splitFilter: SplitFilter<FilterOperator>
  ): ParsedFilter<TValue> | undefined {
    const parsedName = this.parseNameString(attribute, splitFilter);

    if (parsedName === undefined) {
      // Unable to parse attribute from lhs
      return undefined;
    }

    const parsedValue = this.parseValueString(attribute, splitFilter);

    if (parsedValue === undefined) {
      // Unable to parse value from rhs
      return undefined;
    }

    // Successfully parsed URL filter

    return {
      field: attribute.name,
      operator: splitFilter.operator,
      value: parsedValue
    };
  }
}

export const splitFilterStringByOperator = <TOperator extends string>(
  possibleOperators: TOperator[],
  filterString: string,
  expectSpaceAroundOperator: boolean = true
): SplitFilter<TOperator> | undefined => {
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
};
