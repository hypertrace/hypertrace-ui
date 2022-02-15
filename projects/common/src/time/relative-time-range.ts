import { TimeDuration } from './time-duration';
import { TimeRange } from './time-range';

export class RelativeTimeRange implements TimeRange {
  public readonly startTime: Date = new Date();
  public readonly endTime: Date = new Date();

  public constructor(public readonly duration: Readonly<TimeDuration>) {
    this.endTime.setTime(Date.now());
    this.startTime.setTime(this.endTime.getTime() - this.duration.toMillis());
  }

  public isCustom(): boolean {
    // Right now all RelativeTimeRanges ARE custom; all FixedTimeRanges are NOT
    return false;
  }

  public toUrlString(): string {
    return this.duration.toString();
  }

  public toDisplayString(): string {
    return this.duration.toRelativeString();
  }
}
