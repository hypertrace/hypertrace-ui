import { assertUnreachable } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { FilterAttributeType } from '../../filter-attribute-type';
import { FilterOperator } from '../../filter-operators';
import { SplitFilter } from '../parsed-filter';
import { AbstractFilterParser } from './abstract-filter-parser';

export class ContainsFilterParser extends AbstractFilterParser<PossibleValuesTypes> {
  private static readonly CONTAINS_LHS_DELIMITER: string = '.';
  private static readonly CONTAINS_RHS_DELIMITER: string = ':';

  public supportedAttributeTypes(): FilterAttributeType[] {
    return [FilterAttributeType.StringMap];
  }

  public supportedOperators(): FilterOperator[] {
    return [FilterOperator.ContainsKey, FilterOperator.ContainsKeyValue];
  }

  protected requiresNameParsing(operator: FilterOperator): boolean {
    return operator === FilterOperator.ContainsKeyValue;
  }

  public parseNameString(attribute: FilterAttribute, splitFilter: SplitFilter<FilterOperator>): string | undefined {
    const splitLhs = this.splitLhs(attribute, splitFilter);

    return splitLhs === undefined
      ? undefined
      : super.parseNameString(attribute, { ...splitFilter, lhs: splitLhs.displayName });
  }

  public parseValueString(
    attribute: FilterAttribute,
    splitFilter: SplitFilter<FilterOperator>
  ): PossibleValuesTypes | undefined {
    switch (attribute.type) {
      case FilterAttributeType.StringMap:
        return this.parseStringMapValue(attribute, splitFilter);
      case FilterAttributeType.Number: // Unsupported
      case FilterAttributeType.Boolean: // Unsupported
      case FilterAttributeType.String: // Unsupported
      case FilterAttributeType.Timestamp: // Unsupported
        return undefined;
      default:
        assertUnreachable(attribute.type);
    }
  }

  private parseStringMapValue(
    attribute: FilterAttribute,
    splitFilter: SplitFilter<FilterOperator>
  ): string[] | undefined {
    if (splitFilter.lhs === attribute.displayName) {
      return splitFilter.rhs.split(ContainsFilterParser.CONTAINS_RHS_DELIMITER);
    }

    const splitLhs = this.splitLhs(attribute, splitFilter);

    return splitLhs === undefined || splitLhs.key === undefined ? undefined : [splitLhs.key, splitFilter.rhs];
  }

  private splitLhs(attribute: FilterAttribute, splitFilter: SplitFilter<FilterOperator>): SplitLhs | undefined {
    if (splitFilter.lhs === attribute.displayName) {
      return { displayName: attribute.displayName };
    }

    const parts = splitFilter.lhs.split(ContainsFilterParser.CONTAINS_LHS_DELIMITER);

    return parts.length < 2
      ? undefined
      : {
          displayName: attribute.displayName,
          key: parts.slice(1).join(ContainsFilterParser.CONTAINS_LHS_DELIMITER)
        };
  }
}

type PossibleValuesTypes = string[];

interface SplitLhs {
  displayName: string;
  key?: string;
}
