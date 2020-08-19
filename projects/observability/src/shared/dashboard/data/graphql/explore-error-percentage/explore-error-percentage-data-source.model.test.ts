import { fakeAsync } from '@angular/core/testing';
import { AttributeMetadataType, MetricAggregationType, ObservedGraphQlRequest } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { ExploreErrorPercentageDataSourceModel } from './explore-error-percentage-data-source.model';

describe('API error percentage data source model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: ExploreErrorPercentageDataSourceModel;
  let lastEmittedQuery: unknown;

  const errorCountSpec = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'errorCount',
    MetricAggregationType.Sum
  );
  const callCountSpec = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'numCalls',
    MetricAggregationType.Sum
  );

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new ExploreErrorPercentageDataSourceModel();
    model.api = mockApi as ModelApi;
    model.context = 'API';
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
                [errorCountSpec.resultAlias()]: {
                  value: 10,
                  type: AttributeMetadataType.Number
                },
                [callCountSpec.resultAlias()]: {
                  value: 100,
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
        context: 'API',
        selections: [
          expect.objectContaining({ aggregation: 'sum', name: 'errorCount' }),
          expect.objectContaining({ aggregation: 'sum', name: 'numCalls' })
        ],
        timeRange: expect.objectContaining({ from: new Date(1568907645141), to: new Date(1568911245141) }),
        limit: 1
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
          units: '%'
        }
      });
    });
  }));
});
