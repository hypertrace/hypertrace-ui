import { FeatureState } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { FeatureResolverService } from './feature-resolver.service';

describe('Feature resolver service', () => {
  test('should enable all features', () => {
    runFakeRxjs(({ expectObservable }) => {
      expect(new FeatureResolverService().getFeatureState('random'));
      expectObservable(new FeatureResolverService().getFeatureState('random')).toBe('(x|)', {
        x: FeatureState.Enabled
      });
    });
  });
});
