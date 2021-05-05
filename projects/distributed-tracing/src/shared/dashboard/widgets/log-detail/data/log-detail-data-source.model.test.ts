import { Dictionary } from '@hypertrace/common';
import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { LogEvent } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { LogDetailDataSourceModel } from './log-detail-data-source.model';

describe('Log Detail data source model', () => {
  let spectator!: SpectatorModel<LogDetailDataSourceModel>;
  const attributes: Dictionary<unknown> = {
    key1: 'value1',
    key2: 'value2'
  };
  const logEvent: LogEvent = {
    traceId: 'id1',
    attributes: attributes,
    spanId: 's-id1',
    timestamp: '2021-05-05T00:00:00Z',
    summary: 'test log event'
  };

  const buildModel = createModelFactory({
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(of({}))
      })
    ]
  });
  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {};
    spectator = buildModel(LogDetailDataSourceModel);
    spectator.model.logEvent = logEvent;
    spectator.model.api = mockApi as ModelApi;
  });

  test('test attribute data', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: expect.objectContaining({
          key1: 'value1',
          key2: 'value2'
        })
      });
    });
  });
});
