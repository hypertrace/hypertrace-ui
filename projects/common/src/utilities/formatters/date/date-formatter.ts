import { formatDate } from '@angular/common';
import { defaults } from 'lodash-es';
import { DateCoercer } from '../../coercers/date-coercer';

export const enum DateFormatMode {
  /**
   * `h:mm a` -> `11:11 AM`
   */
  TimeOnly,
  /**
   * `hh:mm:ss a` -> `11:11:00 AM`
   */
  TimeWithSeconds,
  /**
   * `d MMM y` -> `11 Nov 1990`
   */
  DateOnly,
  /**
   * `MMM d` -> `Nov 11`
   */
  MonthAndDayOnly,
  /**
   * `MMM yy` -> `Nov 90`
   */
  MonthAndYearOnly,
  /**
   * `MMMM yyyy` -> `November 1990`
   */
  FullMonthAndYearOnly,
  /**
   * `d MMM y h:mm a` -> `11 Nov 1990 11:11 AM`
   */
  DateWithYearAndTime,
  /**
   * `y-MM-dd hh:mm:ss a` -> `1990-11-11 11:11:00 AM`
   */
  DateAndTimeWithSeconds,
  /**
   * `d MMM h:mm a` -> `11 Nov 11:11 AM`
   */
  DateOnlyAndTime
}

export class DateFormatter {
  private static readonly DEFAULT_OPTIONS: Readonly<Required<DateFormatOptions>> = {
    mode: DateFormatMode.DateWithYearAndTime
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
    return defaults({}, options, DateFormatter.DEFAULT_OPTIONS);
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
      case DateFormatMode.MonthAndYearOnly:
        return 'MMM yy';
      case DateFormatMode.FullMonthAndYearOnly:
        return 'MMMM yyyy';
      case DateFormatMode.DateOnly:
        return 'd MMM y';
      case DateFormatMode.DateWithYearAndTime:
        return 'd MMM y h:mm a';
      case DateFormatMode.DateOnlyAndTime:
        return 'd MMM h:mm a';
      case DateFormatMode.DateAndTimeWithSeconds:
      default:
        return 'y-MM-dd hh:mm:ss a';
    }
  }
}

export interface DateFormatOptions {
  mode?: DateFormatMode;
}
