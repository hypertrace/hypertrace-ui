import { fakeAsync, tick } from '@angular/core/testing';
import { AttributeSpecificationModel, GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { mergeMap } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import {
  ENTITIES_GQL_REQUEST,
  GraphQlEntitiesQueryRequest
} from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';
import { MetricAggregationSpecificationModel } from '../../../data/graphql/specifiers/metric-aggregation-specification.model';
import { TopNDataSourceModel } from './top-n-data-source.model';

describe('Top N Data Source Model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model: TopNDataSourceModel;
  let emittedQuery: GraphQlEntitiesQueryRequest;

  const attributeSpecificationModel = new AttributeSpecificationModel();
  attributeSpecificationModel.attribute = 'name';

  const metricAggregationSpecification = new MetricAggregationSpecificationModel();
  metricAggregationSpecification.metric = 'numCalls';
  metricAggregationSpecification.aggregation = MetricAggregationType.Sum;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };

    model = new TopNDataSourceModel();
    model.entityType = ObservabilityEntityType.Api;
    model.api = mockApi as ModelApi;
    model.resultLimit = 3;
    model.attributeSpecification = attributeSpecificationModel;

    model.query$.subscribe(query => (emittedQuery = query.buildRequest([]) as GraphQlEntitiesQueryRequest));
  });

  test('builds expected Entity requests for Last Hour', fakeAsync(() => {
    model
      .getData()
      .pipe(mergeMap(fetcher => fetcher.getData(metricAggregationSpecification)))
      .subscribe();

    tick();

    const expectedQuery: GraphQlEntitiesQueryRequest = {
      requestType: ENTITIES_GQL_REQUEST,
      entityType: ObservabilityEntityType.Api,
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      properties: [attributeSpecificationModel, metricAggregationSpecification],
      limit: 3,
      sort: {
        direction: 'DESC',
        key: metricAggregationSpecification
      },
      filters: []
    };

    expect(expectedQuery).toEqual(emittedQuery);
  }));
});
