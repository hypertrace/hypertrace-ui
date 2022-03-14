import { TimeRange } from './time-range';

export class FixedTimeRange implements TimeRange {
  public static fromUrlString(urlString: string): undefined | FixedTimeRange {
    const URL_REG_EX: RegExp = /(\d+)-(\d+)/;

    const captures = URL_REG_EX.exec(urlString);
    if (!captures || captures.length !== 3) {
      return undefined;
    }

    try {
      return new FixedTimeRange(new Date(parseInt(captures[1])), new Date(parseInt(captures[2])));
    } catch (e) {
      return undefined;
    }
  }

  public constructor(public readonly startTime: Date, public readonly endTime: Date) {}

  public toUrlString(): string {
    return `${this.startTime.getTime()}-${this.endTime.getTime()}`;
  }

  public toDisplayString(): string {
    return `${this.startTime.toLocaleString()} - ${this.endTime.toLocaleString()}`;
  }

  public isCustom(): boolean {
    // Right now all RelativeTimeRanges are NOT custom; all FixedTimeRanges are
    return false;
  }
}
