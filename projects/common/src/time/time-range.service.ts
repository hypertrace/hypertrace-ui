import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash-es';
import { EMPTY, ReplaySubject } from 'rxjs';
import { catchError, defaultIfEmpty, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { NavigationService, QueryParamObject } from '../navigation/navigation.service';
import { ReplayObservable } from '../utilities/rxjs/rxjs-utils';
import { FixedTimeRange } from './fixed-time-range';
import { RelativeTimeRange } from './relative-time-range';
import { TimeDuration } from './time-duration';
import { TimeDurationService } from './time-duration.service';
import { TimeRange } from './time-range';
import { TimeUnit } from './time-unit.type';
import { ParamMap } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TimeRangeService {
  private static readonly TIME_RANGE_QUERY_PARAM: string = 'time';

  private readonly defaultTimeRange: TimeRange = new RelativeTimeRange(new TimeDuration(1, TimeUnit.Day));
  private readonly timeRangeSubject$: ReplaySubject<TimeRange> = new ReplaySubject(1);
  private currentTimeRange?: TimeRange;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeDurationService: TimeDurationService
  ) {
    this.initializeTimeRange();
    this.navigationService.registerGlobalQueryParamKey(TimeRangeService.TIME_RANGE_QUERY_PARAM);
  }

  public getShareableCurrentUrl(): string {
    const timeRangeParamValue = this.navigationService.getQueryParameter(TimeRangeService.TIME_RANGE_QUERY_PARAM, '');
    const timeRangeParam = `${TimeRangeService.TIME_RANGE_QUERY_PARAM}=${timeRangeParamValue}`;
    const timeRange = this.getCurrentTimeRange();
    const fixedTimeRange: FixedTimeRange = TimeRangeService.toFixedTimeRange(timeRange.startTime, timeRange.endTime);
    const newTimeRangeParam = `${TimeRangeService.TIME_RANGE_QUERY_PARAM}=${fixedTimeRange.toUrlString()}`;

    return this.navigationService.getAbsoluteCurrentUrl().replace(timeRangeParam, newTimeRangeParam);
  }

  public getTimeRangeAndChanges(): ReplayObservable<TimeRange> {
    return this.timeRangeSubject$.asObservable();
  }

  public getCurrentTimeRange(): TimeRange {
    if (!this.currentTimeRange) {
      throw Error('Time range not yet initialized');
    }

    return this.currentTimeRange;
  }

  public setRelativeRange(value: number, unit: TimeUnit): this {
    return this.setTimeRange(TimeRangeService.toRelativeTimeRange(value, unit));
  }

  public setFixedRange(startTime: Date, endTime: Date): this {
    return this.setTimeRange(TimeRangeService.toFixedTimeRange(startTime, endTime));
  }

  public refresh(): void {
    this.setTimeRange(this.getCurrentTimeRange());
  }

  private initializeTimeRange(): void {
    this.navigationService.navigation$
      .pipe(
        map(activeRoute => activeRoute.snapshot.queryParamMap),
        distinctUntilChanged((prevParamMap, currParamMap) => this.shouldNotUpdateTimeRange(prevParamMap, currParamMap)),
        map(paramMap => paramMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM)), // Extract the time range value from it
        filter((timeRangeString): timeRangeString is string => {
          if (isEmpty(timeRangeString)) {
            /**
             * This will add the a time param to the url and re-trigger navigation$
             */
            this.setTimeRange(this.defaultTimeRange);

            return false;
          }

          return true;
        }), // Only valid time ranges
        map(timeRangeString => this.timeRangeFromUrlString(timeRangeString)),
        catchError(() => EMPTY),
        defaultIfEmpty(this.defaultTimeRange)
      )
      .subscribe(timeRange => {
        this.currentTimeRange = timeRange;
        this.timeRangeSubject$.next(timeRange);
      });
  }

  private shouldNotUpdateTimeRange(prevParamMap: ParamMap, currParamMap: ParamMap): boolean {
    return (
      prevParamMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM) ===
      currParamMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM)
    );
  }

  private timeRangeFromUrlString(timeRangeFromUrl: string): TimeRange {
    const duration = this.timeDurationService.durationFromString(timeRangeFromUrl);
    if (duration) {
      return new RelativeTimeRange(duration);
    }
    const fixedTimeRange = FixedTimeRange.fromUrlString(timeRangeFromUrl);
    if (fixedTimeRange) {
      return fixedTimeRange;
    }

    throw new Error(); // Caught in observable
  }

  private setTimeRange(newTimeRange: TimeRange): this {
    this.navigationService.addQueryParametersToUrl({
      [TimeRangeService.TIME_RANGE_QUERY_PARAM]: newTimeRange.toUrlString()
    });

    return this;
  }

  public static toRelativeTimeRange(value: number, unit: TimeUnit): RelativeTimeRange {
    return new RelativeTimeRange(new TimeDuration(value, unit));
  }

  public static toFixedTimeRange(startTime: Date, endTime: Date): FixedTimeRange {
    return new FixedTimeRange(startTime, endTime);
  }

  public toQueryParams(timeRange: TimeRange): QueryParamObject {
    const queryParams: QueryParamObject = {
      [TimeRangeService.TIME_RANGE_QUERY_PARAM]: timeRange.toUrlString()
    };

    return queryParams;
  }
}
