import { ApplicationFeature } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { FeatureResolverService } from './feature-resolver.service';

describe('Feature resolver service', () => {
  test('should return true for all non-TR related features', () => {
    runFakeRxjs(({ expectObservable }) => {
      expect(new FeatureResolverService().getFeatureFlagValue('random'));
      expectObservable(new FeatureResolverService().getFeatureFlagValue('random')).toBe('(x|)', {
        x: true
      });
    });
  });

  test('should return false for page TR feature', () => {
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
