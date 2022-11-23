import { TimeDuration } from './time-duration';
import { TimeRange } from './time-range';

export class RelativeTimeRange implements TimeRange {
  public readonly startTime: Date = new Date();
  public readonly endTime: Date = new Date();

  public constructor(
    public readonly duration: Readonly<TimeDuration>,
    /**
     * We set seconds and milliseconds to zero in the GraphQL
     * call for faster processing of the query in the backend
     */
    private readonly shouldSetSecondsToZero: boolean = true
  ) {
    this.endTime.setTime(Date.now());
    this.startTime.setTime(this.endTime.getTime() - this.duration.toMillis());

    if (this.shouldSetSecondsToZero) {
      this.endTime.setSeconds(0, 0);
      this.startTime.setSeconds(0, 0);
    }
  }

  public isCustom(): boolean {
    // Right now all RelativeTimeRanges are NOT custom; all FixedTimeRanges are
    return true;
  }

  public toUrlString(): string {
    return this.duration.toString();
  }

  public toDisplayString(): string {
    return this.duration.toRelativeString();
  }
}
