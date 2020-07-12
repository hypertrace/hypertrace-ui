import { NavigationService } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { Trace, traceIdKey, traceTypeKey } from '@hypertrace/distributed-tracing';
import { mockProvider } from '@ngneat/spectator/jest';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { ApiTraceNavigationHandlerModel } from './api-trace-navigation-handler.model';

describe('Api Trace Navigation Handler Model', () => {
  const trace: Trace = {
    [traceIdKey]: 'test-id',
    [traceTypeKey]: ObservabilityTraceType.Transaction
  };

  const buildModel = createModelFactory({
    providers: [
      mockProvider(NavigationService, {
        navigateWithinApp: jest.fn()
      })
    ]
  });

  test('calls navigateWithinApp with correct parameters', () => {
    const spectator = buildModel(ApiTraceNavigationHandlerModel);
    const navService = spectator.get(NavigationService);

    spectator.model.execute(trace);

    expect(navService.navigateWithinApp).not.toHaveBeenCalled();

    trace[traceTypeKey] = ObservabilityTraceType.Api;
    spectator.model.execute(trace);

    expect(navService.navigateWithinApp).toHaveBeenLastCalledWith(['api-trace', 'test-id']);
  });
});
