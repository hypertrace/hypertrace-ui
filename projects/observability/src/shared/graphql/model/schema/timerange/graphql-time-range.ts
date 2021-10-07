import { TimeRange } from '@hypertrace/common';

export class GraphQlTimeRange {
  public static fromTimeRange(timeRange: Pick<TimeRange, 'startTime' | 'endTime'>): GraphQlTimeRange {
    return new GraphQlTimeRange(timeRange.startTime, timeRange.endTime);
  }

  public constructor(public readonly from: Date | number, public readonly to: Date | number) {}

  public asArgumentObject(): { startTime: Date; endTime: Date } {
    return {
      startTime: typeof this.from === 'number' ? new Date(this.from) : this.from,
      endTime: typeof this.to === 'number' ? new Date(this.to) : this.to
    };
  }
}
