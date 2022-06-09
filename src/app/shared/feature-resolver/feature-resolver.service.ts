import { Injectable } from '@angular/core';
import { ApplicationFeature, FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public getFeatureState(flag: string): Observable<FeatureState> {
    switch (flag) {
      case ApplicationFeature.PageTimeRange:
        return of(FeatureState.Disabled);
      case ApplicationFeature.SavedQueries:
        return of(FeatureState.Disabled);
      default:
        return of(FeatureState.Enabled);
    }
  }
}
