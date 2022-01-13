import { Injectable } from '@angular/core';
import { isEqual, minBy } from 'lodash-es';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ReplayObservable } from '../utilities/rxjs/rxjs-utils';
import { TimeDuration } from './time-duration';
import { TimeDurationService } from './time-duration.service';
import { TimeRange } from './time-range';
import { TimeRangeService } from './time-range.service';
import { TimeUnit } from './time-unit.type';

@Injectable({ providedIn: 'root' })
export class IntervalDurationService {
  private static readonly PREDEFINED_INTERVALS: TimeDuration[] = [
    new TimeDuration(1, TimeUnit.Second),
    new TimeDuration(15, TimeUnit.Second),
    new TimeDuration(30, TimeUnit.Second),
    new TimeDuration(1, TimeUnit.Minute),
    new TimeDuration(5, TimeUnit.Minute),
    new TimeDuration(15, TimeUnit.Minute),
    new TimeDuration(30, TimeUnit.Minute),
    new TimeDuration(1, TimeUnit.Hour),
    new TimeDuration(6, TimeUnit.Hour),
    new TimeDuration(12, TimeUnit.Hour),
    new TimeDuration(1, TimeUnit.Day),
    new TimeDuration(1, TimeUnit.Week),
    new TimeDuration(1, TimeUnit.Month),
    new TimeDuration(3, TimeUnit.Month),
    new TimeDuration(1, TimeUnit.Year)
  ];

  public readonly availableIntervals$: ReplayObservable<TimeDuration[]>;

  public constructor(
    private readonly timeRangeService: TimeRangeService,
    private readonly timeDurationService: TimeDurationService
  ) {
    this.availableIntervals$ = timeRangeService.getTimeRangeAndChanges().pipe(
      map(timeRange => this.getAvailableIntervalsForTimeRange(timeRange)),
      distinctUntilChanged(isEqual)
    );
  }

  public getAvailableIntervalsForTimeRange(
    timeRange: TimeRange = this.timeRangeService.getCurrentTimeRange(),
    maximumDataPoints: number = 500
  ): TimeDuration[] {
    // Can make this configurable at some point, but for now, an interval musts produce at least 3 data points
    return this.getAvailableIntervals(timeRange, 3, maximumDataPoints);
  }

  public getClosestMatch(duration: TimeDuration, availableDurations: TimeDuration[]): TimeDuration | undefined {
    return minBy(availableDurations, definedDuration => Math.abs(duration.toMillis() - definedDuration.toMillis()));
  }

  public getExactMatch(duration: TimeDuration, availableDurations: TimeDuration[]): TimeDuration | undefined {
    return availableDurations.find(availableDuration => duration.equals(availableDuration));
  }

  public getAutoDuration(
    timeRange: TimeRange = this.timeRangeService.getCurrentTimeRange(),
    maximumDataPoints?: number
  ): TimeDuration {
    // Currently sorted smallest to largest
    const availableDurations = this.getAvailableIntervalsForTimeRange(timeRange, maximumDataPoints);

    return this.getAutoDurationFromTimeDurations(availableDurations);
  }

  public getAutoDurationFromTimeDurations(durations: TimeDuration[]): TimeDuration {
    if (durations.length === 0) {
      throw Error('No intervals supported at requested time range');
    }

    // Get largest supported duration
    return durations[durations.length - 1];
  }

  private getAvailableIntervals(timeRange: TimeRange, minDataPoints: number, maxDataPoints: number): TimeDuration[] {
    const timeRangeDuration = this.timeDurationService.getTimeRangeDuration(timeRange);

    return IntervalDurationService.PREDEFINED_INTERVALS.filter(duration =>
      this.isValidDurationForTimeRange(duration, timeRangeDuration, minDataPoints, maxDataPoints)
    );
  }

  private isValidDurationForTimeRange(
    duration: TimeDuration,
    timeRangeDuration: TimeDuration,
    minDataPoints: number,
    maxDataPoints: number
  ): boolean {
    const timeRangeDurationMs = timeRangeDuration.toMillis();
    const maximumAllowableDuration = timeRangeDurationMs / minDataPoints;
    const minimumAllowableDuration = timeRangeDurationMs / maxDataPoints;

    return duration.toMillis() >= minimumAllowableDuration && duration.toMillis() <= maximumAllowableDuration;
  }
}
