import { Injectable } from '@angular/core';
import { isNil } from 'lodash-es';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { ApplicationFeature } from '../constants/application-constants';
import { FeatureStateResolver } from '../feature/state/feature-state.resolver';
import { FeatureState } from '../feature/state/feature.state';
import { NavigationService } from '../navigation/navigation.service';
import { PreferenceService, StorageType } from '../preference/preference.service';
import { RelativeTimeRange } from './relative-time-range';
import { TimeDuration } from './time-duration';
import { TimeRange } from './time-range';
import { TimeRangeService } from './time-range.service';
import { TimeUnit } from './time-unit.type';

@Injectable({ providedIn: 'root' })
export class PageTimeRangePreferenceService {
  private static readonly STORAGE_TYPE: StorageType = StorageType.Local;
  private static readonly TIME_RANGE_PREFERENCE_KEY: string = 'page-time-range';

  private readonly pageTimeRangeStringDictionary$: Observable<PageTimeRangeStringDictionary>;

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService,
    private readonly featureStateResolver: FeatureStateResolver
  ) {
    this.pageTimeRangeStringDictionary$ = this.buildPageTimeRangeObservable();
  }

  public getTimeRangePreferenceForPage(rootLevelPath: string): Observable<TimeRangeResolver> {
    return combineLatest([
      this.pageTimeRangeStringDictionary$,
      this.featureStateResolver.getFeatureState(ApplicationFeature.PageTimeRange)
    ]).pipe(
      map(([pageTimeRangeStringDictionary, featureState]) => {
        if (featureState === FeatureState.Enabled) {
          if (isNil(pageTimeRangeStringDictionary[rootLevelPath])) {
            return () => this.getDefaultTimeRangeForPath(rootLevelPath);
          }

          return () => this.timeRangeService.timeRangeFromUrlString(pageTimeRangeStringDictionary[rootLevelPath]);
        }

        // When FF is disabled
        return () => this.getGlobalDefaultTimeRange();
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

  public getDefaultTimeRangeForPath(rootLevelPath: string): TimeRange {
    const routeConfigForPath = this.navigationService.getRouteConfig(
      [rootLevelPath],
      this.navigationService.rootRoute()
    );

    // Right side for when FF is enabled but 'defaultTimeRange' is not set on AR data
    return routeConfigForPath?.data?.defaultTimeRange ?? this.getGlobalDefaultTimeRange();
  }

  public getGlobalDefaultTimeRange(): TimeRange {
    return new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour));
  }
}

interface PageTimeRangeStringDictionary {
  [path: string]: string;
}
export type TimeRangeResolver = () => TimeRange;
