import { FilterType } from '../../filter-type';
import { UserFilterOperator } from '../filter-api';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringFilterBuilder extends AbstractFilterBuilder<string | string[] | undefined> {
  private static readonly DELIMITER: string = ',';

  public convertValue(value: unknown, operator: UserFilterOperator): string | string[] | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (operator === UserFilterOperator.In) {
      return String(value)
        .split(StringFilterBuilder.DELIMITER)
        .map(str => str.trim());
    }

    return String(value);
  }

  public convertValueToString(value: unknown, operator: UserFilterOperator): string {
    const converted = this.convertValue(value, operator);

    if (converted === undefined) {
      return '';
    }

    if (converted instanceof Array) {
      return converted.join(StringFilterBuilder.DELIMITER);
    }

    return converted;
  }

  public supportedValue(): FilterType {
    return FilterType.String;
  }

  public supportedOperators(): UserFilterOperator[] {
    return [UserFilterOperator.Equals, UserFilterOperator.NotEquals, UserFilterOperator.In];
  }
}
