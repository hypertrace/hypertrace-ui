import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, share } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { PreferenceService, StorageType } from '../preference/preference.service';
import { TimeRange } from './time-range';
import { TimeRangeService } from './time-range.service';

@Injectable({ providedIn: 'root' })
export class TimeRangeForPageService {
  // TODO change to local ??
  private static readonly STORAGE_TYPE: StorageType = StorageType.Session;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';

  private readonly pageTimeRanges$: BehaviorSubject<PageTimeRangeMap> = new BehaviorSubject<PageTimeRangeMap>({});
  private readonly storedTimeRanges$: Observable<PageTimeRangeMap> = this.preferenceService.get<PageTimeRangeMap>(
    TimeRangeForPageService.TIME_RANGE_PREFERENCE_KEY,
    {},
    TimeRangeForPageService.STORAGE_TYPE
  );

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService
  ) {
    this.storedTimeRanges$.subscribe(values => {
      this.pageTimeRanges$.next(values);
    });
  }
  public getDefaultPageTimeRange(path: string): TimeRange {
    const defaultTimeRange = this.navigationService.getRouteConfig([path], this.navigationService.rootRoute())?.data
      ?.defaultTimeRange;

    if (!defaultTimeRange) {
      //  Use current time range as default default
      return this.timeRangeService.getCurrentTimeRange();
    }

    return defaultTimeRange;
  }

  public getTimeRangeForCurrentPage(path: string): Observable<TimeRange> {
    return this.storedTimeRanges$.pipe(
      distinctUntilChanged((prev, curr) => prev[path] === curr[path]),
      map(timeRanges => {
        if (isNil(timeRanges[path])) {
          const timeRangeForPath = this.getDefaultPageTimeRange(path);
          this.setTimeRangeForCurrentPage(path, timeRangeForPath);

          return timeRangeForPath;
        }

        return this.timeRangeService.timeRangeFromUrlString(timeRanges[path]);
      }),
      share()
    );
  }

  public setTimeRangeForCurrentPage(path: string, value: TimeRange): void {
    const pageTimeMap: PageTimeRangeMap = this.pageTimeRanges$.getValue();

    const newMap: PageTimeRangeMap = { ...pageTimeMap, [path]: value.toUrlString() };

    this.preferenceService.set(
      TimeRangeForPageService.TIME_RANGE_PREFERENCE_KEY,
      newMap,
      TimeRangeForPageService.STORAGE_TYPE
    );
  }
}

interface PageTimeRangeMap {
  [path: string]: string;
}
