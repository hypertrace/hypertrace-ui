import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { PreferenceService, StorageType } from '../preference/preference.service';
import { TimeRange } from './time-range';
import { TimeRangeService } from './time-range.service';

@Injectable({ providedIn: 'root' })
export class UserSpecifiedTimeRangeService {
  private static readonly STORAGE_TYPE: StorageType = StorageType.Session;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';

  private readonly pageTimeRanges$: Observable<PageTimeRangeStringDictionary>;
  private currentTimeRangeMap?: PageTimeRangeStringDictionary;

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService
  ) {
    this.pageTimeRanges$ = this.buildPageTimeRangeObservable();
  }

  public getUserSpecifiedTimeRangeForPage(path: string): Observable<TimeRange> {
    return this.pageTimeRanges$.pipe(
      map(timeRanges => {
        if (isNil(timeRanges[path])) {
          const timeRangeForPath = this.getDefaultPageTimeRange(path);
          this.setUserSpecifiedTimeRangeForPage(path, timeRangeForPath);

          return timeRangeForPath;
        }

        return this.timeRangeService.timeRangeFromUrlString(timeRanges[path]);
      })
    );
  }

  public setUserSpecifiedTimeRangeForPage(path: string, value: TimeRange): void {
    const newMap: PageTimeRangeStringDictionary = { ...(this.currentTimeRangeMap ?? {}), [path]: value.toUrlString() };
    this.preferenceService.set(
      UserSpecifiedTimeRangeService.TIME_RANGE_PREFERENCE_KEY,
      newMap,
      UserSpecifiedTimeRangeService.STORAGE_TYPE
    );
  }

  private buildPageTimeRangeObservable(): Observable<PageTimeRangeStringDictionary> {
    return this.preferenceService
      .get<PageTimeRangeStringDictionary>(
        UserSpecifiedTimeRangeService.TIME_RANGE_PREFERENCE_KEY,
        {},
        UserSpecifiedTimeRangeService.STORAGE_TYPE
      )
      .pipe(tap(timeRangeMap => (this.currentTimeRangeMap = timeRangeMap)));
  }

  private getDefaultPageTimeRange(path: string): TimeRange {
    const defaultTimeRange = this.navigationService.getRouteConfig([path], this.navigationService.rootRoute())?.data
      ?.defaultTimeRange;

    return defaultTimeRange ?? this.timeRangeService.getCurrentTimeRange();
  }
}

interface PageTimeRangeStringDictionary {
  [path: string]: string;
}
