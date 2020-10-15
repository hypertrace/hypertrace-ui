import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FeatureStateResolver } from '../state/feature-state.resolver';
import { FeatureState } from '../state/feature.state';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public getFeatureState(_: string): Observable<FeatureState> {
    return of(FeatureState.Enabled);
  }
}
