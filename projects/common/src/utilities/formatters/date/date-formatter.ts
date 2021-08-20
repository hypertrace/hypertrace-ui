import { formatDate } from '@angular/common';
import { defaults } from 'lodash-es';
import { DateCoercer } from '../../coercers/date-coercer';

export const enum DateFormatMode {
  TimeOnly,
  TimeWithSeconds,
  DateOnly,
  MonthAndDayOnly,
  DateAndTime,
  DateAndTimeWithSeconds
}

export class DateFormatter {
  private static readonly DEFAULT_OPTIONS: Readonly<Required<DateFormatOptions>> = {
    mode: DateFormatMode.DateAndTime
  };

  protected readonly options: Readonly<Required<DateFormatOptions>>;
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  // Temporary placeholder, need to flesh this out
  public constructor(options: DateFormatOptions = {}) {
    this.options = this.applyOptionDefaults(options);
  }

  public format(value: Date | number | undefined | string): string {
    return this.convertDateToString(value);
  }

  protected applyOptionDefaults(options: DateFormatOptions): Readonly<Required<DateFormatOptions>> {
    const newOptions = defaults({}, options, DateFormatter.DEFAULT_OPTIONS);

    return newOptions;
  }

  protected convertDateToString(value: Date | number | string | undefined): string {
    const coercedValue = this.dateCoercer.coerce(value);
    if (coercedValue === undefined) {
      return '-';
    }

    return formatDate(coercedValue, this.getFormatString(), 'en_US');
  }

  private getFormatString(): string {
    switch (this.options.mode) {
      case DateFormatMode.TimeWithSeconds:
        return 'hh:mm:ss a';
      case DateFormatMode.TimeOnly:
        return 'h:mm a';
      case DateFormatMode.MonthAndDayOnly:
        return 'MMM d';
      case DateFormatMode.DateOnly:
        return 'd MMM y';
      case DateFormatMode.DateAndTime:
        return 'd MMM y h:mm a';
      case DateFormatMode.DateAndTimeWithSeconds:
      default:
        return 'y-MM-dd hh:mm:ss a';
    }
  }
}

export interface DateFormatOptions {
  mode?: DateFormatMode;
}
