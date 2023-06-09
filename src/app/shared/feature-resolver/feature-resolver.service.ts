import { Injectable } from '@angular/core';
import { ApplicationFeature, FeatureFlagValue, FeatureStateResolver } from '@hypertrace/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public getFeatureFlagValue<T extends FeatureFlagValue = FeatureFlagValue>(feature: string): Observable<T> {
    switch (feature) {
      case ApplicationFeature.PageTimeRange:
        return of(false as T);
      case ApplicationFeature.FeatureDefaultTimeRangeMap:
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return of({} as T);
      case ApplicationFeature.TriggerBasedSearch:
        return of(false as T);
      default:
        return of(true as T);
    }
  }
}
