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

  public static parse(time: string): Time {
    // Using hardcoded epoch start to parse the time portion only of an ISO string
    const scheduledDate: Date = new Date(`1970-01-01T${time}`);

    return new Time(
      scheduledDate.getUTCHours(),
      scheduledDate.getUTCMinutes(),
      scheduledDate.getUTCSeconds(),
      scheduledDate.getUTCMilliseconds(),
      true
    );
  }

  public toISOString(useTimezoneOffset: boolean = false): string {
    if (useTimezoneOffset) {
      /*
       * WARNING: This format is currently unsupported by at least some backend APIs e.g. Reporting
       */
      return this.toOffsetISOString();
    }

    return this.date.toISOString().substring(11);
  }

  private toOffsetISOString(): string {
    const date = this.date;
    const timezone = date.getTimezoneOffset();
    const sign = timezone <= 0 ? '+' : '-';

    const pad = function (n: number): string {
      return (n < 10 ? '0' : '') + n;
    };

    return (
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds()) +
      sign +
      pad(Math.floor(timezone / 60)) +
      ':' +
      pad(timezone % 60)
    );
  }

  public equals(other?: Time): boolean {
    return this.toISOString() === other?.toISOString();
  }
}
