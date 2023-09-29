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
});
