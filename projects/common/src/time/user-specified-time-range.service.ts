import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, share } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { PreferenceService, StorageType } from '../preference/preference.service';
import { TimeRange } from './time-range';
import { TimeRangeService } from './time-range.service';

@Injectable({ providedIn: 'root' })
export class UserSpecifiedTimeRangeService {
  private static readonly STORAGE_TYPE: StorageType = StorageType.Session;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';

  private readonly pageTimeRangesSubject$: BehaviorSubject<PageTimeRangeMap> = new BehaviorSubject<PageTimeRangeMap>(
    {}
  );
  private readonly storedTimeRanges$: Observable<PageTimeRangeMap> = this.preferenceService.get<PageTimeRangeMap>(
    UserSpecifiedTimeRangeService.TIME_RANGE_PREFERENCE_KEY,
    {},
    UserSpecifiedTimeRangeService.STORAGE_TYPE
  );

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService
  ) {
    this.storedTimeRanges$.subscribe(values => {
      this.pageTimeRangesSubject$.next(values);
    });
  }
  private getDefaultPageTimeRange(path: string): TimeRange {
    const defaultTimeRange = this.navigationService.getRouteConfig([path], this.navigationService.rootRoute())?.data
      ?.defaultTimeRange;

    if (!defaultTimeRange) {
      //  Use current time range as default default
      return this.timeRangeService.getCurrentTimeRange();
    }

    return defaultTimeRange;
  }

  public getUserSpecifiedTimeRangeForPage(path: string): Observable<TimeRange> {
    return this.storedTimeRanges$.pipe(
      distinctUntilChanged((prev, curr) => prev[path] === curr[path]),
      map(timeRanges => {
        if (isNil(timeRanges[path])) {
          const timeRangeForPath = this.getDefaultPageTimeRange(path);
          this.setUserSpecifiedTimeRangeForPage(path, timeRangeForPath);

          return timeRangeForPath;
        }

        return this.timeRangeService.timeRangeFromUrlString(timeRanges[path]);
      }),
      share()
    );
  }

  public setUserSpecifiedTimeRangeForPage(path: string, value: TimeRange): void {
    const pageTimeMap: PageTimeRangeMap = this.pageTimeRangesSubject$.getValue();

    const newMap: PageTimeRangeMap = { ...pageTimeMap, [path]: value.toUrlString() };
    this.preferenceService.set(
      UserSpecifiedTimeRangeService.TIME_RANGE_PREFERENCE_KEY,
      newMap,
      UserSpecifiedTimeRangeService.STORAGE_TYPE
    );
  }
}

interface PageTimeRangeMap {
  [path: string]: string;
}
