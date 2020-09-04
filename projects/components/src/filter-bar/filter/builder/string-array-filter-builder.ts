import { FilterType } from '../../filter-type';
import { UserFilterOperator } from '../filter-api';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringArrayFilterBuilder extends AbstractFilterBuilder<string[] | undefined> {
  private static readonly DELIMITER: string = ':';

  public convertValue(value: unknown): string[] | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value instanceof Array) {
      return value.map(String);
    }

    return String(value)
      .split(StringArrayFilterBuilder.DELIMITER)
      .map(str => str.trim());
  }

  public convertValueToString(value: unknown): string {
    const converted = this.convertValue(value);

    return converted === undefined ? '' : converted.join(StringArrayFilterBuilder.DELIMITER);
  }

  public supportedValue(): FilterType {
    return FilterType.StringMap;
  }

  public supportedOperators(): UserFilterOperator[] {
    return [UserFilterOperator.ContainsKey, UserFilterOperator.ContainsKeyValue];
  }
}
