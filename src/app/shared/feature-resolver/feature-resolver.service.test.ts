import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DynamicConfigurationService, FeatureState } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { FeatureResolverService } from './feature-resolver.service';
describe('Feature resolver service', () => {
  test('should enable all features', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DynamicConfigurationService]
    });
    runFakeRxjs(({ expectObservable }) => {
      const config = TestBed.get(DynamicConfigurationService);
      expect(new FeatureResolverService(config).getFeatureState('random'));
      expectObservable(new FeatureResolverService(config).getFeatureState('random')).toBe('(x|)', {
        x: FeatureState.Enabled
      });
    });
  });
});
