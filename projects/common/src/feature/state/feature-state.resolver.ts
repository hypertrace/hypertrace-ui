import { Observable } from 'rxjs';
import { defaultIfEmpty, map } from 'rxjs/operators';
import { forkJoinSafeEmpty } from '../../utilities/rxjs/rxjs-utils';
import { Dictionary } from '../../utilities/types/types';
import { FeatureState } from './feature.state';

export abstract class FeatureStateResolver {
  public abstract getFeatureFlagValue<T extends FeatureFlagValue = FeatureFlagValue>(feature: string): Observable<T>;

  public getFeatureState(feature: string): Observable<FeatureState> {
    return this.getFeatureFlagValue(feature).pipe(
      map(featureFlagValue => this.convertFlagValueToFeatureState(featureFlagValue))
    );
  }

  private convertFlagValueToFeatureState(flagValue: FeatureFlagValue): FeatureState {
    return Boolean(flagValue) ? FeatureState.Enabled : FeatureState.Disabled;
  }

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

export type FeatureFlagValue = boolean | string | number | Dictionary<string> | undefined;
