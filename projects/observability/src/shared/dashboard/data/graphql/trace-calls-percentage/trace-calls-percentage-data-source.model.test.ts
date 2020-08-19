import { fakeAsync } from '@angular/core/testing';
import {
  AttributeMetadataType,
  GraphQlFieldFilter,
  GraphQlOperatorType,
  MetricAggregationType,
  MetricHealth,
  ObservedGraphQlRequest
} from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import {
  ExploreGraphQlQueryHandlerService,
  ExploreSpecificationBuilder,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResponse
} from '@hypertrace/observability';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { TraceCallsPercentageDataSourceModel } from './trace-calls-percentage-data-source.model';

describe('Trace Calls Percentage Data Source Model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: TraceCallsPercentageDataSourceModel;
  const emittedQueries: GraphQlExploreRequest[] = [];

  const callCountSpec = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'calls',
    MetricAggregationType.Count
  );

  const totalCallsSpec = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'calls',
    MetricAggregationType.Sum
  );

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new TraceCallsPercentageDataSourceModel();
    model.api = mockApi as ModelApi;
    model.filters = [new GraphQlFieldFilter('duration', GraphQlOperatorType.GreaterThan, 500)];
    model.query$.subscribe(
      (query: ObservedGraphQlRequest<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>) => {
        const request = query.buildRequest([]);
        emittedQueries.push(request);

        if (request.filters === undefined) {
          const responseObserver = query.responseObserver;
          responseObserver.next({
            results: [
              {
                [totalCallsSpec.resultAlias()]: {
                  value: 100,
                  type: AttributeMetadataType.Number
                }
              }
            ]
          });
          responseObserver.complete();
        } else {
          const responseObserver = query.responseObserver;
          responseObserver.next({
            results: [
              {
                [callCountSpec.resultAlias()]: {
                  value: 10,
                  type: AttributeMetadataType.Number
                }
              }
            ]
          });
          responseObserver.complete();
        }
      }
    );
  });

  test('builds expected request', () => {
    const data$ = model.getData();
    data$.subscribe();

    expect(emittedQueries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          requestType: EXPLORE_GQL_REQUEST,
          context: 'API_TRACE',
          selections: [expect.objectContaining({ aggregation: 'sum', name: 'calls' })],
          timeRange: expect.objectContaining({ from: new Date(1568907645141), to: new Date(1568911245141) }),
          limit: 1
        }),
        expect.objectContaining({
          requestType: EXPLORE_GQL_REQUEST,
          context: 'API_TRACE',
          filters: [
            expect.objectContaining({ key: 'duration', operator: GraphQlOperatorType.GreaterThan, value: 500 })
          ],
          selections: [expect.objectContaining({ aggregation: 'count', name: 'calls' })],
          timeRange: expect.objectContaining({ from: new Date(1568907645141), to: new Date(1568911245141) }),
          limit: 1
        })
      ])
    );
  });

  test('Converts response correctly', fakeAsync(() => {
    const data$ = model.getData();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(data$).toBe('(x|)', {
        x: {
          value: 10,
          health: MetricHealth.NotSpecified,
          units: '%'
        }
      });
    });
  }));
});
