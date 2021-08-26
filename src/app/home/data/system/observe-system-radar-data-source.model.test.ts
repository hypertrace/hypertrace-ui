import { fakeAsync, tick } from '@angular/core/testing';
import { TimeDuration, TimeDurationService, TimeRange, TimeUnit } from '@hypertrace/common';
import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { ModelApi } from '@hypertrace/hyperdash';
import {
  AttributeMetadataType,
  ExploreGraphQlQueryHandlerService,
  ExploreSpecification,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlQueryEventService,
  GraphQlTimeRange,
  MetricAggregationType,
  ObservabilityTraceType,
  ObservedGraphQlRequest
} from '@hypertrace/observability';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { mergeMap } from 'rxjs/operators';
import { ObserveSystemRadarDataSourceModel } from './observe-system-radar-data-source.model';

describe('Observe System radar data source model', () => {
  let spectator: SpectatorModel<ObserveSystemRadarDataSourceModel>;
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let emittedRequests: GraphQlExploreRequest[];
  const modelFactory = createModelFactory();

  const mockApi: Partial<ModelApi> = {
    getTimeRange: jest.fn(() => testTimeRange)
  };

  const exploreRequest = (timeRange: GraphQlTimeRange, selection: Partial<ExploreSpecification>) => ({
    requestType: EXPLORE_GQL_REQUEST,
    timeRange: timeRange,
    context: ObservabilityTraceType.Api,
    limit: 1,
    selections: [expect.objectContaining(selection)]
  });

  const buildSelection = (name: string, aggregation: MetricAggregationType) => ({
    name: name,
    aggregation: aggregation
  });

  beforeEach(() => {
    emittedRequests = [];

    spectator = modelFactory(ObserveSystemRadarDataSourceModel, {
      providers: [
        mockProvider(TimeDurationService, {
          getTimeRangeDuration: (timeRange: Pick<TimeRange, 'startTime' | 'endTime'>) =>
            new TimeDuration(timeRange.endTime.getTime() - timeRange.startTime.getTime(), TimeUnit.Millisecond)
        }),
        mockProvider(GraphQlQueryEventService)
      ]
    });

    spectator.model.api = mockApi as ModelApi;
    spectator.model.query$.subscribe((query: ObservedGraphQlRequest<ExploreGraphQlQueryHandlerService>) => {
      emittedRequests.push(query.buildRequest([]));
      query.responseObserver.next({
        results: [
          {
            'p99(duration)': {
              type: AttributeMetadataType.Number,
              value: 23
            },
            'avgrate_sec(calls)': {
              type: AttributeMetadataType.Number,
              value: 33
            },
            'avg(duration)': {
              type: AttributeMetadataType.Number,
              value: 43
            },
            'avgrate_sec(errorCount)': {
              type: AttributeMetadataType.Number,
              value: 53
            }
          }
        ]
      });
      query.responseObserver.complete();
    });
  });

  test('builds expected requests for Last Hour', fakeAsync(() => {
    spectator.model
      .getData()
      .pipe(mergeMap(fetcher => fetcher.getData(new TimeDuration(1, TimeUnit.Hour))))
      .subscribe(() => {
        // NOOP
      });

    tick();

    const current = new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime);
    const lastHour = new GraphQlTimeRange(
      new Date(testTimeRange.startTime.valueOf() - new TimeDuration(1, TimeUnit.Hour).toMillis()),
      new Date(testTimeRange.endTime.valueOf() - new TimeDuration(1, TimeUnit.Hour).toMillis())
    );

    const expectedRequests = [
      exploreRequest(current, buildSelection('duration', MetricAggregationType.P99)),
      exploreRequest(current, buildSelection('calls', MetricAggregationType.AvgrateSecond)),
      exploreRequest(current, buildSelection('duration', MetricAggregationType.Average)),
      exploreRequest(current, buildSelection('errorCount', MetricAggregationType.AvgrateSecond)),
      exploreRequest(lastHour, buildSelection('duration', MetricAggregationType.P99)),
      exploreRequest(lastHour, buildSelection('calls', MetricAggregationType.AvgrateSecond)),
      exploreRequest(lastHour, buildSelection('duration', MetricAggregationType.Average)),
      exploreRequest(lastHour, buildSelection('errorCount', MetricAggregationType.AvgrateSecond))
    ];

    expect(emittedRequests).toEqual(expectedRequests);
  }));

  test('builds expected requests and response', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        spectator.model.getData().pipe(mergeMap(fetcher => fetcher.getData(new TimeDuration(1, TimeUnit.Hour))))
      ).toBe('(x|)', {
        x: {
          current: [
            {
              axis: 'P99 Latency',
              value: 23
            },
            {
              axis: 'Calls/Second',
              value: 33
            },
            {
              axis: 'Avg Latency',
              value: 43
            },
            {
              axis: 'Errors/Second',
              value: 53
            }
          ],
          previous: [
            {
              axis: 'P99 Latency',
              value: 23
            },
            {
              axis: 'Calls/Second',
              value: 33
            },
            {
              axis: 'Avg Latency',
              value: 43
            },
            {
              axis: 'Errors/Second',
              value: 53
            }
          ]
        }
      });
    });
  }));
});
