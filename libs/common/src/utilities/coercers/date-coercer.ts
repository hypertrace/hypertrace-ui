import { TimeDuration } from '../../time/time-duration';
import { TimeUnit } from '../../time/time-unit.type';
import { Coercer, CoercerOptions } from './coercer';

export class DateCoercer extends Coercer<Date, DateCoercerOptions> {
  private static readonly DEFAULT_TIME_WINDOW: DateCoercerOptions = {
    earliestDate: new Date(Date.now() - new TimeDuration(10, TimeUnit.Year).toMillis()),
    latestDate: new Date(Date.now() + new TimeDuration(10, TimeUnit.Year).toMillis())
  };

  public constructor(options: DateCoercerOptions = {}) {
    super(options);
  }

  protected assignDefaults(options: DateCoercerOptions): DateCoercerOptions {
    return {
      ...DateCoercer.DEFAULT_TIME_WINDOW,
      ...super.assignDefaults(options)
    };
  }

  protected tryCoerceSingleValue(value: unknown): Date | undefined {
    if (!(typeof value === 'string' || typeof value === 'number' || value instanceof Date)) {
      return undefined;
    }

    const valueAsDate = typeof value === 'string' && !isNaN(Number(value)) ? new Date(+value) : new Date(value);

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
