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
  private static readonly STORAGE_TYPE: StorageType = StorageType.Local;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';

  private readonly pageTimeRangeStringDictionary$: Observable<PageTimeRangeStringDictionary>;

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService
  ) {
    this.pageTimeRangeStringDictionary$ = this.buildPageTimeRangeObservable();
  }

  public getTimeRangePreferenceForPage(rootLevelPath: string): Observable<TimeRange | undefined> {
    return this.pageTimeRangeStringDictionary$.pipe(
      map(pageTimeRangeStringDictionary => {
        if (isNil(pageTimeRangeStringDictionary[rootLevelPath])) {
          return this.getDefaultPageTimeRange(rootLevelPath);
        }

        return this.timeRangeService.timeRangeFromUrlString(pageTimeRangeStringDictionary[rootLevelPath]);
      })
    );
  }

  public setTimeRangePreferenceForPage(rootLevelPath: string, value: TimeRange): void {
    this.pageTimeRangeStringDictionary$.pipe(take(1)).subscribe(currentPageTimeRangeDictionary => {
      this.setPreferenceServicePageTimeRange(currentPageTimeRangeDictionary, rootLevelPath, value);
    });
  }

  private setPreferenceServicePageTimeRange(
    currentTimeRangeDictionary: PageTimeRangeStringDictionary,
    rootLevelPath: string,
    timeRange: TimeRange
  ): void {
    this.preferenceService.set(
      PageTimeRangePreferenceService.TIME_RANGE_PREFERENCE_KEY,
      { ...currentTimeRangeDictionary, [rootLevelPath]: timeRange.toUrlString() },
      PageTimeRangePreferenceService.STORAGE_TYPE
    );
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

  private getDefaultPageTimeRange(path: string): TimeRange | undefined {
    const defaultTimeRange = this.navigationService.getRouteConfig([path], this.navigationService.rootRoute())?.data
      ?.defaultTimeRange;

    return defaultTimeRange;
  }
}

interface PageTimeRangeStringDictionary {
  [path: string]: string;
}
