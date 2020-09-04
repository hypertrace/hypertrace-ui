import { NavigationService } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { Span, spanIdKey } from '../../../../graphql/model/schema/span';
import { SpanTraceNavigationHandlerModel } from './span-trace-navigation-handler.model';

describe('Span Trace Navigation Handler Model', () => {
  const span: Span = {
    [spanIdKey]: 'test-id'
  };

  const buildModel = createModelFactory({
    providers: [
      mockProvider(NavigationService, {
        navigateWithinApp: jest.fn()
      })
    ]
  });

  test('calls navigateWithinApp with correct parameters', () => {
    const spectator = buildModel(SpanTraceNavigationHandlerModel);
    const navService = spectator.get(NavigationService);

    spectator.model.execute(span);

    expect(navService.navigateWithinApp).not.toHaveBeenCalled();

    span.traceId = 'test-trace-id';
    spectator.model.execute(span);

    expect(navService.navigateWithinApp).toHaveBeenLastCalledWith(['trace', 'test-trace-id', { spanId: 'test-id' }]);
  });
});
