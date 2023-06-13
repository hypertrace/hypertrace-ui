import { mockProvider } from '@ngneat/spectator/jest';
import { FeatureStateResolver } from './feature-state.resolver';
import { FeatureState } from './feature.state';
import { Dictionary } from '../../utilities/types/types';
import { FactoryProvider } from '@angular/core';
import { of } from 'rxjs';

type MockFeatureStateMap = Dictionary<FeatureState>;
export const getMockFeatureStateResolver = (ffState: MockFeatureStateMap): FactoryProvider =>
  mockProvider(FeatureStateResolver, {
    getFeatureState: jest.fn().mockImplementation(feature => of(ffState[feature] ?? FeatureState.Disabled)),
    getCombinedFeatureState: jest.fn().mockImplementation(features => {
      const areAllFFsEnabled = features.every(
        (feature: string) => (ffState[feature] ?? FeatureState.Disabled) === FeatureState.Enabled
      );

      return of(areAllFFsEnabled ? FeatureState.Enabled : FeatureState.Disabled);
    })
  });
