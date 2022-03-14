import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { PreferenceService, StorageType } from '../preference/preference.service';
import { TimeRange } from './time-range';
import { TimeRangeService } from './time-range.service';

@Injectable({ providedIn: 'root' })
export class PageTimeRangePreferenceService {
  private static readonly STORAGE_TYPE: StorageType = StorageType.Session;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';

  private readonly pageTimeRangeStringDictionary$: Observable<PageTimeRangeStringDictionary>;

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService
  ) {
    this.pageTimeRangeStringDictionary$ = this.buildPageTimeRangeObservable();
  }

  public getTimeRangePreferenceForPage(path: string): Observable<TimeRange> {
    return this.pageTimeRangeStringDictionary$.pipe(
      map(pageTimeRangeStringDictionary => {
        if (isNil(pageTimeRangeStringDictionary[path])) {
          const timeRangeForPath = this.getDefaultPageTimeRange(path);

          return timeRangeForPath;
        }

        return this.timeRangeService.timeRangeFromUrlString(pageTimeRangeStringDictionary[path]);
      })
    );
  }

  public setTimeRangePreferenceForPage(path: string, value: TimeRange): void {
    this.getPageTimeRangeStringDictionary()
      .pipe(take(1))
      .subscribe(currentPageTimeRangeDictionary => {
        this.setPreferenceServicePageTimeRange(currentPageTimeRangeDictionary, path, value);
      });
  }

  private setPreferenceServicePageTimeRange(
    currentTimeRangeDictionary: PageTimeRangeStringDictionary,
    path: string,
    timeRange: TimeRange
  ): void {
    this.preferenceService.set(
      PageTimeRangePreferenceService.TIME_RANGE_PREFERENCE_KEY,
      { ...currentTimeRangeDictionary, [path]: timeRange.toUrlString() },
      PageTimeRangePreferenceService.STORAGE_TYPE
    );
  }

  private getPageTimeRangeStringDictionary(): Observable<PageTimeRangeStringDictionary> {
    return this.pageTimeRangeStringDictionary$;
  }

  private buildPageTimeRangeObservable(): Observable<PageTimeRangeStringDictionary> {
    return this.preferenceService
      .get<PageTimeRangeStringDictionary>(
        PageTimeRangePreferenceService.TIME_RANGE_PREFERENCE_KEY,
        {},
        PageTimeRangePreferenceService.STORAGE_TYPE
      )
      .pipe(shareReplay(1));
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
