import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { ModelApi } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../../../graphql/model/metrics/metric-aggregation';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { ObservabilityTraceType } from '../../../../../graphql/model/schema/observability-traces';
import { GraphQlTimeRange } from '../../../../../graphql/model/schema/timerange/graphql-time-range';
import { ExploreSpecificationBuilder } from '../../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { EXPLORE_GQL_REQUEST } from '../../../../../graphql/request/handlers/explore/explore-query';
import { TraceMetricTimeseriesDataSourceModel } from './trace-metric-timeseries-data-source.model';

describe('Trace metric timeseries data source model', () => {
  const specBuilder = new ExploreSpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  const testInterval = new TimeDuration(15, TimeUnit.Second);
  let model!: TraceMetricTimeseriesDataSourceModel;
  let lastEmittedQueryBuilder: (filters: GraphQlFilter[]) => unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new TraceMetricTimeseriesDataSourceModel();
    model.specification = specBuilder.exploreSpecificationForKey('duration', MetricAggregationType.Average);
    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => (lastEmittedQueryBuilder = query.buildRequest));
    model.getData().subscribe(fetcher => fetcher.getData(testInterval));
  });

  test('builds expected request', () => {
    model.getData();
    expect(lastEmittedQueryBuilder([])).toEqual({
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      context: ObservabilityTraceType.Api,
      interval: testInterval,
      limit: 10000,
      selections: [model.specification]
    });
  });
});
