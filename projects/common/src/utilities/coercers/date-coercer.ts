import { Coercer, CoercerOptions } from './coercer';

export class DateCoercer extends Coercer<Date, DateCoercerOptions> {
  public constructor(options: DateCoercerOptions = {}) {
    super(options);
  }

  protected assignDefaults(options: DateCoercerOptions): DateCoercerOptions {
    const tenYearsInMillis = 10 * 365 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const tenYearsAgo = new Date(now - tenYearsInMillis);
    const tenYearsFuture = new Date(now + tenYearsInMillis);

    return {
      earliestDate: tenYearsAgo,
      latestDate: tenYearsFuture,
      ...super.assignDefaults(options)
    };
  }

  protected tryCoerceSingleValue(value: unknown): Date | undefined {
    if (!(typeof value === 'string' || typeof value === 'number' || value instanceof Date)) {
      return undefined;
    }

    const valueAsDate = new Date(value);

    if (isNaN(valueAsDate.getTime()) || !this.isDateInAllowableRange(valueAsDate)) {
      return undefined;
    }

    return valueAsDate;
  }
  private isDateInAllowableRange(value: Date): boolean {
    if (this.options.earliestDate && this.options.earliestDate > value) {
      return false;
    }

    if (this.options.latestDate && this.options.latestDate < value) {
      return false;
    }

    return true;
  }
}

interface DateCoercerOptions extends CoercerOptions<Date> {
  earliestDate?: Date;
  latestDate?: Date;
}
