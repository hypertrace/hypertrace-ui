import { IsFeatureStateEnabledPipe } from './is-feature-state-enabled.pipe';
import { FeatureState } from '@hypertrace/common';

describe('IsFeatureStateEnabledPipe', () => {
  const pipe = new IsFeatureStateEnabledPipe();

  test('should transform as expected', () => {
    expect(pipe.transform(FeatureState.Enabled)).toBe(true);
    expect(pipe.transform(FeatureState.Disabled)).toBe(false);
    expect(pipe.transform(FeatureState.Preview)).toBe(false);
    expect(pipe.transform('random' as FeatureState)).toBe(false);
    expect(pipe.transform(undefined)).toBe(false);
  });
});
