import { ModelApi } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../../../graphql/model/metrics/metric-aggregation';
import { ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { GraphQlTimeRange } from '../../../../../graphql/model/schema/timerange/graphql-time-range';
import { ObservabilitySpecificationBuilder } from '../../../../../graphql/request/builders/selections/observability-specification-builder';
import { ENTITY_GQL_REQUEST } from '../../../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { EntityMetricAggregationDataSourceModel } from './entity-metric-aggregation-data-source.model';

describe('Entity metric aggregation data source model', () => {
  const specBuilder = new ObservabilitySpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: EntityMetricAggregationDataSourceModel;
  let lastEmittedQueryBuilder: (filters: GraphQlFilter[]) => unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new EntityMetricAggregationDataSourceModel();
    model.specification = specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average);
    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => (lastEmittedQueryBuilder = query.buildRequest));
    model.getData();
  });

  test('throws if no inherited entity filter', () => {
    expect(() => lastEmittedQueryBuilder([])).toThrow();
  });

  test('builds expected request', () => {
    model.getData();
    expect(lastEmittedQueryBuilder([new GraphQlEntityFilter('test', ObservabilityEntityType.Service)])).toEqual({
      requestType: ENTITY_GQL_REQUEST,
      properties: [model.specification],
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      entityType: ObservabilityEntityType.Service,
      id: 'test'
    });
  });
});
