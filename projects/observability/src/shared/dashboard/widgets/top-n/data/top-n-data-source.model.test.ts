import { fakeAsync, tick } from '@angular/core/testing';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { mergeMap } from 'rxjs/operators';
import { TopNDataSourceModel } from './top-n-data-source.model';
import {
  EXPLORE_GQL_REQUEST,
  ExploreSelectionSpecificationModel,
  ExploreSpecification,
  ExploreSpecificationBuilder,
  GraphQlExploreRequest
} from '@hypertrace/observability';

describe('Top N Data Source Model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model: TopNDataSourceModel;
  let emittedQuery: GraphQlExploreRequest;

  const exploreSelectionSpecification = new ExploreSelectionSpecificationModel();
  exploreSelectionSpecification.metric = 'numCalls';
  exploreSelectionSpecification.aggregation = MetricAggregationType.Sum;

  const specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();
  const nameAttributeSpec: ExploreSpecification = specBuilder.exploreSpecificationForKey('name');
  const idAttributeSpec: ExploreSpecification = specBuilder.exploreSpecificationForKey('id');

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

    const expectedQuery: GraphQlExploreRequest = {
      requestType: EXPLORE_GQL_REQUEST,
      context: 'API',
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      selections: [nameAttributeSpec, idAttributeSpec, exploreSelectionSpecification],
      limit: 3,
      orderBy: [
        {
          direction: 'DESC',
          key: exploreSelectionSpecification
        }
      ],
      filters: [],
      groupBy: {
        keys: [nameAttributeSpec.name, idAttributeSpec.name]
      }
    };

    expect(expectedQuery).toEqual(emittedQuery);
  }));
});
