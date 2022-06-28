import { Injectable } from '@angular/core';
import { ApplicationFeature, FeatureFlagValue, FeatureStateResolver } from '@hypertrace/common';
import { EMPTY, Observable, of } from 'rxjs';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public getFeatureFlagValue<T extends FeatureFlagValue = FeatureFlagValue>(feature: string): Observable<T> {
    switch (feature) {
      case ApplicationFeature.PageTimeRange:
        return of(false as T);
      case ApplicationFeature.FeatureDefaultTimeRange:
        return of(({ 'path-1': '1h', 'path-2': '1d' } as unknown) as T); // Dummy data
      default:
        return EMPTY;
    }
  }
}
