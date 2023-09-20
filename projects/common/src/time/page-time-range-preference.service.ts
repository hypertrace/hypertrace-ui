import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationFeature } from '../constants/application-constants';
import { FeatureStateResolver } from '../feature/state/feature-state.resolver';
import { FeatureState } from '../feature/state/feature.state';
import { NavigationService } from '../navigation/navigation.service';
import { Dictionary } from '../utilities/types/types';
import { RelativeTimeRange } from './relative-time-range';
import { TimeDuration } from './time-duration';
import { TimeRange } from './time-range';
import { TimeRangeService } from './time-range.service';
import { TimeUnit } from './time-unit.type';

@Injectable({ providedIn: 'root' })
export class PageTimeRangePreferenceService {
  public constructor(
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService,
    private readonly featureStateResolver: FeatureStateResolver
  ) {}

  public getTimeRangePreferenceForPage(rootLevelPath: string): Observable<TimeRangeResolver> {
    return combineLatest([
      this.featureStateResolver.getFeatureState(ApplicationFeature.PageTimeRange),
      this.featureStateResolver.getFeatureFlagValue<Dictionary<string>>(ApplicationFeature.FeatureDefaultTimeRangeMap)
    ]).pipe(
      map(([featureState, featureDefaultTimeRangeMap]) => {
        if (featureState === FeatureState.Enabled) {
          if (rootLevelPath in featureDefaultTimeRangeMap) {
            return () => this.timeRangeService.timeRangeFromUrlString(featureDefaultTimeRangeMap[rootLevelPath]);
          }

          return () => this.getDefaultTimeRangeForPath(rootLevelPath);
        }

        // When FF is disabled
        return () => this.maybeGetCurrentTimeRange() ?? this.getGlobalDefaultTimeRange();
      })
    );
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
    return new RelativeTimeRange(new TimeDuration(1, TimeUnit.Day));
  }

  private maybeGetCurrentTimeRange(): TimeRange | undefined {
    return this.timeRangeService.maybeGetCurrentTimeRange();
  }
}

export type TimeRangeResolver = () => TimeRange;
