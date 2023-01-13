/*
 * There are places where we want to specify a Time without a Date
 * associated. This is what this class is for.
 */
import { DateFormatMode, DateFormatter } from '../utilities/formatters/date/date-formatter';

export class Time {
  private readonly dateFormatter: DateFormatter = new DateFormatter({ mode: DateFormatMode.TimeOnly });
  private readonly _date: Date;

  public constructor(
    public readonly hours: number,
    public readonly minutes: number = 0,
    public readonly seconds: number = 0,
    public readonly milliseconds: number = 0,
    public readonly isUTC: boolean = false
  ) {
    this._date = new Date();

    if (this.isUTC) {
      this._date.setUTCHours(this.hours, this.minutes, this.seconds, this.milliseconds);
    } else {
      this._date.setHours(this.hours, this.minutes, this.seconds, this.milliseconds);
    }
  }

  public get label(): string {
    return this.dateFormatter.format(this.date);
  }

  public get date(): Date {
    return this._date;
  }

  public static parse(time: string, isUTC: boolean = false): Time {
    // Using hardcoded epoch start to parse the time portion only of an ISO string
    const scheduledDate: Date = new Date(`1970-01-01T${time}`);

    return new Time(
      scheduledDate.getHours(),
      scheduledDate.getMinutes(),
      scheduledDate.getSeconds(),
      scheduledDate.getMilliseconds(),
      isUTC
    );
  }

  public toISOString(): string {
    return this.date.toISOString().substring(11);
  }

  public equals(other?: Time): boolean {
    return this.toISOString() === other?.toISOString();
  }
}
