import { ModelApi } from '@hypertrace/hyperdash';
import { GraphQlFilter, GraphQlTimeRange, MetricAggregationType } from '@hypertrace/observability';
import { ObservabilityTraceType } from '../../../../../graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { EXPLORE_GQL_REQUEST } from '../../../../../graphql/request/handlers/explore/explore-query';
import { TraceMetricAggregationDataSourceModel } from './trace-metric-aggregation-data-source.model';

describe('Trace metric aggregation data source model', () => {
  const specBuilder = new ExploreSpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: TraceMetricAggregationDataSourceModel;
  let lastEmittedQueryBuilder: (filters: GraphQlFilter[]) => unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new TraceMetricAggregationDataSourceModel();
    model.specification = specBuilder.exploreSpecificationForKey('duration', MetricAggregationType.Average);
    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => (lastEmittedQueryBuilder = query.buildRequest));
    model.getData();
  });

  test('builds expected request', () => {
    model.getData();
    expect(lastEmittedQueryBuilder([])).toEqual({
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      context: ObservabilityTraceType.Api,
      limit: 1,
      selections: [model.specification]
    });
  });
});
