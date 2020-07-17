import { fakeAsync, tick } from '@angular/core/testing';
import { AttributeSpecificationModel, GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { flatMap } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ENTITIES_GQL_REQUEST } from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { MetricAggregationSpecificationModel } from '../../../data/graphql/specifiers/metric-aggregation-specification.model';
import { TopNDataSourceModel } from './top-n-data-source.model';

describe('Top N Data Source Model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model: TopNDataSourceModel;
  let emittedQueries: unknown[];
  const attributeSpecificationModel = new AttributeSpecificationModel();
  attributeSpecificationModel.attribute = 'name';
  attributeSpecificationModel.modelOnInit();

  const metricAggregationSpecification = new MetricAggregationSpecificationModel();
  metricAggregationSpecification.metric = 'numCalls';
  metricAggregationSpecification.aggregation = MetricAggregationType.Sum;
  metricAggregationSpecification.modelOnInit();

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };

    model = new TopNDataSourceModel();
    model.entityType = ObservabilityEntityType.Api;
    model.api = mockApi as ModelApi;
    model.resultLimit = 3;
    model.attributeSpecification = attributeSpecificationModel;
    emittedQueries = [];
    model.query$.subscribe(query => emittedQueries.push(query.buildRequest([])));
  });

  test('builds expected requests for Last Hour', fakeAsync(() => {
    model
      .getData()
      .pipe(flatMap(fetcher => fetcher.getData(metricAggregationSpecification)))
      .subscribe();

    tick();
    const graphQltimeRange = new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime);
    const expectedEntityQuery = {
      requestType: ENTITIES_GQL_REQUEST,
      entityType: ObservabilityEntityType.Api,
      properties: [
        expect.objectContaining({
          attribute: attributeSpecificationModel.attribute
        }),
        expect.objectContaining({
          metric: metricAggregationSpecification.metric,
          aggregation: metricAggregationSpecification.aggregation
        })
      ],
      limit: 3,
      sort: {
        direction: 'DESC',
        key: expect.objectContaining({
          metric: metricAggregationSpecification.metric,
          aggregation: metricAggregationSpecification.aggregation
        })
      }
    };

    const expectedExploreQuery: GraphQlExploreRequest = {
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: graphQltimeRange,
      context: ObservabilityEntityType.Api,
      filters: [],
      limit: 1,
      selections: [
        expect.objectContaining({
          name: metricAggregationSpecification.metric,
          aggregation: metricAggregationSpecification.aggregation
        })
      ]
    };

    expect(emittedQueries[0]).toEqual(expect.objectContaining(expectedEntityQuery));
    expect(emittedQueries[1]).toEqual(expect.objectContaining(expectedExploreQuery));
  }));
});
