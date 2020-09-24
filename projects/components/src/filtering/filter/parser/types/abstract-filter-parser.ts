import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { ParsedFilter } from '../parsed-filter';

export abstract class AbstractFilterParser<TValue> {
  protected abstract supportedAttributeTypes(): FilterAttributeType[];
  public abstract supportedOperators(): FilterOperator[];

  protected abstract parseValueString(attribute: FilterAttribute, valueString: string): TValue | undefined;

  public parseFilterString(attributes: FilterAttribute[], filterString: string): ParsedFilter<TValue> | undefined {
    const splitFilter = this.splitFilterString(filterString);

    if (splitFilter === undefined) {
      return undefined;
    }

    const attribute = attributes.find(a => a.name.toLowerCase() === splitFilter.key.toLowerCase());

    if (attribute === undefined) {
      return undefined;
    }

    const parsedValue: TValue | undefined = this.parseValueString(attribute, splitFilter.value);

    if (parsedValue === undefined) {
      return undefined;
    }

    return {
      key: attribute.name,
      operator: splitFilter.operator,
      value: parsedValue
    };
  }

  protected splitFilterString(filterString: string): ParsedFilter<string> | undefined {
    const matchingOperator = this.supportedOperators()
      .sort((o1: string, o2: string) => o2.length - o1.length) // Sort by length to check multichar ops first
      .map(op => ` ${op} `)
      .find(op => filterString.includes(op));

    if (matchingOperator === undefined) {
      return undefined;
    }

    const parts = filterString
      .split(matchingOperator)
      .map(str => str.trim())
      .filter(strPart => strPart.length > 0);

    if (parts.length < 3) {
      return undefined;
    }

    return {
      key: parts[0],
      operator: parts[1] as FilterOperator,
      value: parts[2]
    };
  }
}
