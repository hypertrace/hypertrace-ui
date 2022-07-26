import { Injectable } from '@angular/core';
import { ApplicationFeature, FeatureFlagValue, FeatureStateResolver } from '@hypertrace/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public getFeatureFlagValue<T extends FeatureFlagValue = FeatureFlagValue>(feature: string): Observable<T> {
    switch (feature) {
      case ApplicationFeature.TraceableViewOnly:
      case ApplicationFeature.PageTimeRange:
        return of(false as T);
      case ApplicationFeature.FeatureDefaultTimeRangeMap:
        // tslint:disable-next-line: no-object-literal-type-assertion
        return of({} as T);
      default:
        return of(true as T);
    }
  }
}
