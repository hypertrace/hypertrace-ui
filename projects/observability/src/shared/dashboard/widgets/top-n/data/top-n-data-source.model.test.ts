import { fakeAsync, tick } from '@angular/core/testing';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { mergeMap } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { EXPLORE_GQL_REQUEST, GraphQlExploreRequest } from '../../../../graphql/request/handlers/explore/explore-query';
import { TopNDataSourceModel } from './top-n-data-source.model';
import { TopNExploreSelectionSpecificationModel } from './top-n-explore-selection-specification.model';

describe('Top N Data Source Model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model: TopNDataSourceModel;
  let emittedQuery: GraphQlExploreRequest;

  const exploreSpecBuilder = new ExploreSpecificationBuilder();
  const topNOptionSpec = new TopNExploreSelectionSpecificationModel();
  topNOptionSpec.nameKey = 'nameKey';
  topNOptionSpec.idKey = 'idKey';
  topNOptionSpec.metric = exploreSpecBuilder.exploreSpecificationForKey('numCalls', MetricAggregationType.Sum);
  topNOptionSpec.context = 'API_CONTEXT';

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };

    model = new TopNDataSourceModel();
    model.entityType = ObservabilityEntityType.Api;
    model.api = mockApi as ModelApi;
    model.resultLimit = 3;

    model.query$.subscribe(query => (emittedQuery = query.buildRequest([]) as GraphQlExploreRequest));
  });

  test('builds expected explore requests', fakeAsync(() => {
    model
      .getData()
      .pipe(mergeMap(fetcher => fetcher.getData(topNOptionSpec)))
      .subscribe();

    tick();

    expect(emittedQuery).toEqual(
      expect.objectContaining({
        requestType: EXPLORE_GQL_REQUEST,
        context: 'API_CONTEXT',
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        selections: [
          expect.objectContaining({ name: 'nameKey' }),
          expect.objectContaining({ name: 'idKey' }),
          expect.objectContaining(topNOptionSpec.metric)
        ],
        limit: 3,
        orderBy: expect.arrayContaining([
          {
            direction: 'DESC',
            key: topNOptionSpec.metric
          }
        ]),
        filters: [],
        groupBy: expect.objectContaining({
          keys: ['nameKey', 'idKey']
        })
      })
    );
  }));
});
