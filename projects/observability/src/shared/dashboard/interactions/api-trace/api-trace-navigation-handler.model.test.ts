import { createModelFactory } from '@hypertrace/dashboards/testing';
import { Trace, traceIdKey, traceTypeKey, TracingNavigationService } from '@hypertrace/distributed-tracing';
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
      mockProvider(TracingNavigationService, {
        navigateToApiTraceDetail: jest.fn()
      })
    ]
  });

  test('calls navigateToApiTraceDetail with correct parameters', () => {
    const spectator = buildModel(ApiTraceNavigationHandlerModel);
    const navService = spectator.get(TracingNavigationService);

    spectator.model.execute(trace);

    expect(navService.navigateToApiTraceDetail).not.toHaveBeenCalled();

    trace[traceTypeKey] = ObservabilityTraceType.Api;
    spectator.model.execute(trace);

    expect(navService.navigateToApiTraceDetail).toHaveBeenLastCalledWith('test-id', undefined);
  });

  test('calls navigateToApiTraceDetail with startTime', () => {
    const traceWithStarTime: Trace = {
      [traceIdKey]: 'test-id',
      [traceTypeKey]: ObservabilityTraceType.Api,
      startTime: 1576364117792
    };
    const spectator = buildModel(ApiTraceNavigationHandlerModel);
    const navService = spectator.get(TracingNavigationService);

    spectator.model.execute(traceWithStarTime);

    expect(navService.navigateToApiTraceDetail).toHaveBeenLastCalledWith('test-id', 1576364117792);
  });
});
