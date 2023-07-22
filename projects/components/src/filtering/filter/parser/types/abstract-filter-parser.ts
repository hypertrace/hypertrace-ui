import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { ParsedFilter, SplitFilter } from '../parsed-filter';

export abstract class AbstractFilterParser<TValue> {
  public abstract supportedAttributeTypes(): FilterAttributeType[];
  public abstract supportedOperators(): FilterOperator[];

  public abstract parseValueString(splitFilter: SplitFilter<FilterOperator>): TValue | undefined;

  public parseSplitFilter(splitFilter: SplitFilter<FilterOperator>): ParsedFilter<TValue> | undefined {
    const parsedValue = this.parseValueString(splitFilter);

    if (parsedValue === undefined) {
      // Unable to parse value from rhs
      return undefined;
    }

    return {
      field: splitFilter.attribute.name,
      subpath: splitFilter.subpath,
      operator: splitFilter.operator,
      value: parsedValue
    };
  }
}
