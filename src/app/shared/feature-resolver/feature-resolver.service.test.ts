import { ApplicationFeature } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { FeatureResolverService } from './feature-resolver.service';

describe('Feature resolver service', () => {
  test('should enable all non-TR related features', () => {
    runFakeRxjs(({ expectObservable }) => {
      expect(new FeatureResolverService().getFeatureFlagValue('random'));
      expectObservable(new FeatureResolverService().getFeatureFlagValue('random')).toBe('(x|)', {
        x: true
      });
    });
  });

  test('should disable page TR related feature', () => {
    runFakeRxjs(({ expectObservable }) => {
      expect(new FeatureResolverService().getFeatureFlagValue(ApplicationFeature.PageTimeRange));
      expectObservable(new FeatureResolverService().getFeatureFlagValue(ApplicationFeature.PageTimeRange)).toBe(
        '(x|)',
        {
          x: false
        }
      );
    });
  });
});
