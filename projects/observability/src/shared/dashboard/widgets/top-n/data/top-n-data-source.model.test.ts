import { fakeAsync, tick } from '@angular/core/testing';
import { AttributeSpecificationModel, GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { flatMap } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ENTITIES_GQL_REQUEST,
  GraphQlEntitiesQueryRequest
} from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { MetricAggregationSpecificationModel } from '../../../data/graphql/specifiers/metric-aggregation-specification.model';
import { TopNDataSourceModel } from './top-n-data-source.model';

describe('Top N Data Source Model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model: TopNDataSourceModel;
  const emittedQueries: unknown[] = [];

  const attributeSpecificationModel = new AttributeSpecificationModel();
  attributeSpecificationModel.attribute = 'name';

  const metricAggregationSpecification = new MetricAggregationSpecificationModel();
  metricAggregationSpecification.metric = 'numCalls';
  metricAggregationSpecification.aggregation = MetricAggregationType.Sum;
  metricAggregationSpecification.modelOnInit();

  const exploreSpecBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };

    model = new TopNDataSourceModel();
    model.entityType = ObservabilityEntityType.Api;
    model.api = mockApi as ModelApi;
    model.resultLimit = 3;
    model.attributeSpecification = attributeSpecificationModel;

    model.query$.subscribe(query => emittedQueries.push(query.buildRequest([])));
  });

  test('builds expected Entity requests for Last Hour', fakeAsync(() => {
    model
      .getData()
      .pipe(flatMap(fetcher => fetcher.getData(metricAggregationSpecification)))
      .subscribe();

    tick();
    const graphQltimeRange = new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime);
    const expectedEntityQuery: GraphQlEntitiesQueryRequest = {
      requestType: ENTITIES_GQL_REQUEST,
      entityType: ObservabilityEntityType.Api,
      timeRange: graphQltimeRange,
      properties: [attributeSpecificationModel, metricAggregationSpecification],
      limit: 3,
      sort: {
        direction: 'DESC',
        key: metricAggregationSpecification
      },
      filters: []
    };

    const expectedExploreQuery: GraphQlExploreRequest = {
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: graphQltimeRange,
      context: ObservabilityEntityType.Api,
      filters: [],
      limit: 1,
      selections: [
        exploreSpecBuilder.exploreSpecificationForKey(
          metricAggregationSpecification.metric,
          metricAggregationSpecification.aggregation
        )
      ]
    };

    expect(emittedQueries[0]).toEqual(expectedEntityQuery);
    expect(emittedQueries[1]).toEqual(expectedExploreQuery);
  }));
});
