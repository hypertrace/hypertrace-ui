import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';
import { isEmpty, isNil } from 'lodash-es';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import { ApplicationFeature } from '../constants/application-constants';
import { FeatureStateResolver } from '../feature/state/feature-state.resolver';
import { FeatureState } from '../feature/state/feature.state';
import { NavigationService, QueryParamObject } from '../navigation/navigation.service';
import { ReplayObservable } from '../utilities/rxjs/rxjs-utils';
import { FixedTimeRange } from './fixed-time-range';
import { RelativeTimeRange } from './relative-time-range';
import { TimeDuration } from './time-duration';
import { TimeDurationService } from './time-duration.service';
import { TimeRange } from './time-range';
import { TimeUnit } from './time-unit.type';

@Injectable({
  providedIn: 'root'
})
export class TimeRangeService {
  private static readonly TIME_RANGE_QUERY_PARAM: string = 'time';
  private static readonly REFRESH_ON_NAVIGATION: string = 'refresh';

  private readonly timeRangeSubject$: ReplaySubject<TimeRange> = new ReplaySubject(1);
  private currentTimeRange?: TimeRange;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeDurationService: TimeDurationService,
    private readonly featureStateResolver: FeatureStateResolver
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

  private getInitialTimeRange(): Observable<TimeRange> {
    return this.navigationService.navigation$.pipe(
      take(1), // Wait for first navigation
      switchMap(activatedRoute => activatedRoute.queryParamMap), // Get the params from it
      take(1), // Only the first set of params
      map(paramMap => paramMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM)), // Extract the time range value from it
      filter((timeRangeString): timeRangeString is string => !isEmpty(timeRangeString)), // Only valid time ranges
      map(timeRangeString => this.timeRangeFromUrlString(timeRangeString)),
      catchError(() => EMPTY)
    );
  }

  private getPageTimeRangeChanges(): Observable<TimeRange> {
    return this.navigationService.navigation$.pipe(
      switchMap(activeRoute => activeRoute.queryParamMap),
      filter(queryParamMap => !isNil(queryParamMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM))),
      distinctUntilChanged((prevParamMap, currParamMap) => this.shouldNotUpdateTimeRange(prevParamMap, currParamMap)),
      map(currQueryParamMap => {
        const timeRangeQueryParamString = currQueryParamMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM);

        return this.timeRangeFromUrlString(timeRangeQueryParamString!);
      })
    );
  }

  private shouldNotUpdateTimeRange(prevParamMap: ParamMap, currParamMap: ParamMap): boolean {
    const refreshQueryParam = currParamMap.get(TimeRangeService.REFRESH_ON_NAVIGATION);

    return (
      prevParamMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM) ===
        currParamMap.get(TimeRangeService.TIME_RANGE_QUERY_PARAM) && isEmpty(refreshQueryParam)
    );
  }

  private initializeTimeRange(): void {
    this.featureStateResolver
      .getFeatureState(ApplicationFeature.PageTimeRange)
      .pipe(
        switchMap(featureState => {
          if (featureState === FeatureState.Enabled) {
            return this.getPageTimeRangeChanges();
          }

          return this.getInitialTimeRange();
        })
      )
      .subscribe(timeRange => {
        this.setTimeRange(timeRange);
      });
  }

  public timeRangeFromUrlString(timeRangeFromUrl: string): TimeRange {
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
    this.currentTimeRange = newTimeRange;
    this.timeRangeSubject$.next(newTimeRange);
    this.navigationService.addQueryParametersToUrl({
      [TimeRangeService.TIME_RANGE_QUERY_PARAM]: newTimeRange.toUrlString()
    });

    return this;
  }

  public setDefaultTimeRange(timeRange: TimeRange): void {
    if (!this.currentTimeRange) {
      this.setTimeRange(timeRange);
    }
  }

  public static toRelativeTimeRange(value: number, unit: TimeUnit): RelativeTimeRange {
    return new RelativeTimeRange(new TimeDuration(value, unit));
  }

  public static toFixedTimeRange(startTime: Date, endTime: Date): FixedTimeRange {
    return new FixedTimeRange(startTime, endTime);
  }

  public toQueryParams(timeRange: TimeRange, refreshTimeOnNavigationParam: boolean): QueryParamObject {
    let queryParams: QueryParamObject = {
      [TimeRangeService.TIME_RANGE_QUERY_PARAM]: timeRange.toUrlString()
    };

    if (refreshTimeOnNavigationParam) {
      queryParams = { ...queryParams, [TimeRangeService.REFRESH_ON_NAVIGATION]: true };
    }

    return queryParams;
  }

  public isInitialized(): boolean {
    return !isNil(this.currentTimeRange);
  }
}
