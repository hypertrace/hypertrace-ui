import { FilterType } from '../../filter-type';
import { UserFilterOperator } from '../filter-api';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class NumberFilterBuilder extends AbstractFilterBuilder<number | number[] | undefined> {
  private static readonly DELIMITER: string = ',';

  public convertValue(value: unknown, operator: UserFilterOperator): number | number[] | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (operator === UserFilterOperator.In) {
      return String(value)
        .split(NumberFilterBuilder.DELIMITER)
        .map(str => {
          const val = Number(str.trim());

          return isNaN(val) ? undefined : val;
        })
        .filter((val: undefined | number): val is number => val !== undefined);
    }

    return isNaN(Number(value)) ? undefined : Number(value);
  }

  public convertValueToString(value: unknown, operator: UserFilterOperator): string {
    const converted = this.convertValue(value, operator);

    if (converted === undefined) {
      return '';
    }

    if (converted instanceof Array) {
      return converted.join(NumberFilterBuilder.DELIMITER);
    }

    return String(converted);
  }

  public supportedValue(): FilterType {
    return FilterType.Number;
  }

  public supportedOperators(): UserFilterOperator[] {
    return [
      UserFilterOperator.Equals,
      UserFilterOperator.NotEquals,
      UserFilterOperator.LessThan,
      UserFilterOperator.LessThanOrEqualTo,
      UserFilterOperator.GreaterThan,
      UserFilterOperator.GreaterThanOrEqualTo,
      UserFilterOperator.In
    ];
  }
}
