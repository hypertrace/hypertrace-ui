import { Observable } from 'rxjs';
import { defaultIfEmpty, map } from 'rxjs/operators';
import { forkJoinSafeEmpty } from '../../utilities/rxjs/rxjs-utils';
import { FeatureState } from './feature.state';

export abstract class FeatureStateResolver {
  public abstract getFeatureState(feature: string): Observable<FeatureState>;

  public getCombinedFeatureState(features: string[]): Observable<FeatureState> {
    return forkJoinSafeEmpty(features.map(feature => this.getFeatureState(feature))).pipe(
      map(values => this.reduceFeatureState(values)),
      defaultIfEmpty<FeatureState>(FeatureState.Enabled)
    );
  }

  private reduceFeatureState(featureStates: FeatureState[] = []): FeatureState {
    if (featureStates.some(state => state === FeatureState.Disabled)) {
      return FeatureState.Disabled;
    }
    if (featureStates.some(state => state === FeatureState.Preview)) {
      return FeatureState.Preview;
    }

    return FeatureState.Enabled;
  }
}
