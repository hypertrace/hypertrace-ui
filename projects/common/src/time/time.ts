/*
 * There are places where we want to specify a Time without a Date
 * associated. This is what this class is for.
 */
import { DateFormatMode, DateFormatter } from '../utilities/formatters/date/date-formatter';

export class Time {
  private readonly dateFormatter: DateFormatter = new DateFormatter({ mode: DateFormatMode.TimeOnly });

  public get label(): string {
    const date = new Date();
    date.setHours(this.hours, this.minutes, this.seconds, this.milliseconds);

    return this.dateFormatter.format(date);
  }

  public constructor(
    public readonly hours: number,
    public readonly minutes: number = 0,
    public readonly seconds: number = 0,
    public readonly milliseconds: number = 0
  ) {}
}
