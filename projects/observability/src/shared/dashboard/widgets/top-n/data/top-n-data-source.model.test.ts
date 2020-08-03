import { fakeAsync, tick } from '@angular/core/testing';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import {
  ExploreSelectionSpecificationModel,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest
} from '@hypertrace/observability';
import { mergeMap } from 'rxjs/operators';
import { TopNDataSourceModel } from './top-n-data-source.model';

describe('Top N Data Source Model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model: TopNDataSourceModel;
  let emittedQuery: GraphQlExploreRequest;

  const exploreSelectionSpecification = new ExploreSelectionSpecificationModel();
  exploreSelectionSpecification.metric = 'numCalls';
  exploreSelectionSpecification.aggregation = MetricAggregationType.Sum;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };

    model = new TopNDataSourceModel();
    model.context = 'API';
    model.api = mockApi as ModelApi;
    model.resultLimit = 3;

    model.query$.subscribe(query => (emittedQuery = query.buildRequest([]) as GraphQlExploreRequest));
  });

  test('builds expected Entity requests for Last Hour', fakeAsync(() => {
    model
      .getData()
      .pipe(mergeMap(fetcher => fetcher.getData(exploreSelectionSpecification)))
      .subscribe();

    tick();

    expect(emittedQuery).toEqual(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: 'API',
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        selections: [
          expect.objectContaining({ name: 'name' }),
          expect.objectContaining({ name: 'id' }),
          expect.objectContaining({ metric: exploreSelectionSpecification.metric })
        ],
        limit: 3,
        orderBy: expect.arrayContaining([
          {
            direction: 'DESC',
            key: exploreSelectionSpecification
          }
        ]),
        filters: [],
        groupBy: expect.objectContaining({
          keys: ['name', 'id']
        })
      })
    );
  }));
});
