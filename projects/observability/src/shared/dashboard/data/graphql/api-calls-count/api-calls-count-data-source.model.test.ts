import { fakeAsync } from '@angular/core/testing';
import { AttributeMetadataType, MetricAggregationType, ObservedGraphQlRequest } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { ExploreGraphQlQueryHandlerService } from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-query';
import { ApiCallsCountDataSourceModel } from './api-calls-count-data-source-model';

describe('API call count data source model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: ApiCallsCountDataSourceModel;
  let emittedQueries: unknown;

  const numCallsSpec = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'numCalls',
    MetricAggregationType.Sum
  );

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new ApiCallsCountDataSourceModel();
    model.api = mockApi as ModelApi;
    model.query$.subscribe(
      (query: ObservedGraphQlRequest<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>) => {
        const request = query.buildRequest([]);
        emittedQueries = request;

        if (request.requestType === EXPLORE_GQL_REQUEST && request.context === 'API') {
          const responseObserver = query.responseObserver;
          responseObserver.next({
            results: [
              {
                [numCallsSpec.resultAlias()]: {
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

    expect(emittedQueries).toEqual(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: 'API',
        selections: [expect.objectContaining({ aggregation: 'sum', name: 'numCalls' })],
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
          value: 100,
          units: ''
        }
      });
    });
  }));
});
