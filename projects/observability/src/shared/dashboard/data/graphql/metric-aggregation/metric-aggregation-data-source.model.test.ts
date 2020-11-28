import { fakeAsync } from '@angular/core/testing';
import {
  AttributeMetadataType,
  GraphQlFieldFilter,
  GraphQlOperatorType,
  MetricAggregationType,
  ObservedGraphQlRequest
} from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { ExploreSelectionSpecificationModel } from '../specifiers/explore-selection-specification.model';
import { MetricAggregationDataSourceModel } from './metric-aggregation-data-source.model';

describe('Metric aggregation data source model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: MetricAggregationDataSourceModel;
  let lastEmittedQuery: unknown;

  const callCountSpec = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'calls',
    MetricAggregationType.Count
  );

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new MetricAggregationDataSourceModel();
    model.context = 'API_TRACE';
    model.metric = new ExploreSelectionSpecificationModel();
    model.metric.metric = 'calls';
    model.metric.aggregation = MetricAggregationType.Count;
    model.filters = [new GraphQlFieldFilter('duration', GraphQlOperatorType.GreaterThan, 500)];
    model.api = mockApi as ModelApi;
    model.query$.subscribe(
      (query: ObservedGraphQlRequest<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>) => {
        const request = query.buildRequest([]);
        lastEmittedQuery = query.buildRequest([]);
        lastEmittedQuery = request;

        if (request.requestType === EXPLORE_GQL_REQUEST) {
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

    expect(lastEmittedQuery).toEqual(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: 'API_TRACE',
        limit: 1,
        selections: [expect.objectContaining({ name: 'calls', aggregation: MetricAggregationType.Count })],
        timeRange: expect.objectContaining({
          from: new Date(testTimeRange.startTime),
          to: new Date(testTimeRange.endTime)
        }),
        filters: [
          expect.objectContaining({
            key: 'duration',
            operator: GraphQlOperatorType.GreaterThan,
            value: 500
          })
        ]
      })
    );
  });

  test('Converts response correctly', fakeAsync(() => {
    const data$ = model.getData();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(data$).toBe('(x|)', {
        x: {
          health: 'notspecified',
          value: 10,
          units: ''
        }
      });
    });
  }));
});
