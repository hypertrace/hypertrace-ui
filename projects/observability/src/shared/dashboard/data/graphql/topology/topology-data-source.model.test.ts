import { Color } from '@hypertrace/common';
import { GraphQlRequestCacheability, GraphQlRequestOptions } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../../graphql/model/metrics/metric-aggregation';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { GraphQlTimeRange } from '../../../../graphql/model/schema/timerange/graphql-time-range';
import {
  ENTITY_TOPOLOGY_GQL_REQUEST,
  TopologyNodeSpecification,
} from '../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { MetricAggregationSpecificationModel } from '../specifiers/metric-aggregation-specification.model';
import { TopologyMetricCategoryModel } from './metrics/topology-metric-category.model';
import { TopologyMetricWithCategoryModel } from './metrics/topology-metric-with-category.model';
import { TopologyMetricsModel } from './metrics/topology-metrics.model';
import { TopologyDataSourceModel } from './topology-data-source.model';
import { GraphQlFieldFilter } from '../../../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlOperatorType } from '../../../../graphql/model/schema/filter/graphql-filter';

describe('topology data source model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: TopologyDataSourceModel;
  let totalQueries: number = 0;
  let lastEmittedQuery: unknown;
  let lastEmittedQueryRequestOption: GraphQlRequestOptions | undefined;

  const filters = [
    new GraphQlFieldFilter('service_id', GraphQlOperatorType.Equals, 'test-id'),
    new GraphQlFieldFilter('backend_id', GraphQlOperatorType.Equals, 'test-backend-id'),
  ];

  const createCategoryModel = (
    name: string,
    minValue: number,
    fillColor: Color,
    strokeColor: Color,
    focusColor: Color,
    maxValue?: number,
  ): TopologyMetricCategoryModel => {
    const categoryModel = new TopologyMetricCategoryModel();
    categoryModel.name = name;
    categoryModel.minValue = minValue;
    categoryModel.maxValue = maxValue;
    categoryModel.fillColor = fillColor;
    categoryModel.strokeColor = strokeColor;
    categoryModel.focusColor = focusColor;

    return categoryModel;
  };

  const createSpecificationModel = (metric: string, aggregation: MetricAggregationType) => {
    const specification = new MetricAggregationSpecificationModel();
    specification.metric = metric;
    specification.aggregation = aggregation;

    specification.modelOnInit();

    return specification;
  };

  const createMetricWithCategory = (
    spec: MetricAggregationSpecificationModel,
    categories: TopologyMetricCategoryModel[],
  ) => {
    const withCategoryModel = new TopologyMetricWithCategoryModel();
    withCategoryModel.specification = spec;
    withCategoryModel.categories = categories;

    return withCategoryModel;
  };

  const createTopologyMetricsModel = (metric: string, aggregation: MetricAggregationType) => {
    const primary = createMetricWithCategory(createSpecificationModel(metric, aggregation), [
      createCategoryModel(metric, 0, Color.Blue2, Color.Blue3, Color.Blue4, 10),
    ]);

    const metricsModel: TopologyMetricsModel = new TopologyMetricsModel();
    metricsModel.primary = primary;

    return metricsModel;
  };

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange),
    };
    model = new TopologyDataSourceModel();
    model.downstreamEntityTypes = [ObservabilityEntityType.Api, ObservabilityEntityType.Backend];
    model.upstreamEntityTypes = [ObservabilityEntityType.Service];
    model.entityType = ObservabilityEntityType.Service;
    model.nodeMetricsModel = createTopologyMetricsModel('numCalls', MetricAggregationType.Average);
    model.edgeMetricsModel = createTopologyMetricsModel('duration', MetricAggregationType.Average);
    model.edgeFilterConfig = { entityType: ObservabilityEntityType.Backend, fields: ['backend_id'] };

    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => {
      if (totalQueries === 0) {
        // Without filters
        lastEmittedQuery = query.buildRequest([]);
      } else {
        // With filters
        lastEmittedQuery = query.buildRequest(filters);
      }
      lastEmittedQueryRequestOption = query.requestOptions;
      totalQueries += 1;
    });
    model.getData();
  });

  test('builds expected request without filters', () => {
    expect(lastEmittedQuery).toEqual({
      requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
      rootNodeType: ObservabilityEntityType.Service,
      rootNodeSpecification: {
        titleSpecification: expect.objectContaining({ name: 'name' }),
        metricSpecifications: [
          expect.objectContaining({ metric: 'numCalls', aggregation: MetricAggregationType.Average }),
        ],
      },
      rootNodeFilters: [],
      edgeFilters: [],
      rootNodeLimit: 100,
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      downstreamNodeSpecifications: new Map<ObservabilityEntityType, TopologyNodeSpecification>([
        [
          ObservabilityEntityType.Api,
          {
            titleSpecification: expect.objectContaining({ name: 'name' }),
            metricSpecifications: [
              expect.objectContaining({ metric: 'numCalls', aggregation: MetricAggregationType.Average }),
            ],
          },
        ],
        [
          ObservabilityEntityType.Backend,
          {
            titleSpecification: expect.objectContaining({ name: 'name' }),
            metricSpecifications: [
              expect.objectContaining({ metric: 'numCalls', aggregation: MetricAggregationType.Average }),
            ],
          },
        ],
      ]),
      upstreamNodeSpecifications: new Map<ObservabilityEntityType, TopologyNodeSpecification>([
        [
          ObservabilityEntityType.Service,
          {
            titleSpecification: expect.objectContaining({ name: 'name' }),
            metricSpecifications: [
              expect.objectContaining({ metric: 'numCalls', aggregation: MetricAggregationType.Average }),
            ],
          },
        ],
      ]),
      edgeSpecification: {
        metricSpecifications: [
          expect.objectContaining({ metric: 'duration', aggregation: MetricAggregationType.Average }),
        ],
      },
    });

    expect(lastEmittedQueryRequestOption).toEqual({
      cacheability: GraphQlRequestCacheability.Cacheable,
      isolated: true,
    });
  });

  test('builds expected request with filters', () => {
    expect(lastEmittedQuery).toEqual({
      requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
      rootNodeType: ObservabilityEntityType.Service,
      rootNodeSpecification: {
        titleSpecification: expect.objectContaining({ name: 'name' }),
        metricSpecifications: [
          expect.objectContaining({ metric: 'numCalls', aggregation: MetricAggregationType.Average }),
        ],
      },
      rootNodeFilters: [filters[0]],
      edgeFilters: [filters[1]],
      rootNodeLimit: 100,
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      downstreamNodeSpecifications: new Map<ObservabilityEntityType, TopologyNodeSpecification>([
        [
          ObservabilityEntityType.Backend,
          {
            titleSpecification: expect.objectContaining({ name: 'name' }),
            metricSpecifications: [
              expect.objectContaining({ metric: 'numCalls', aggregation: MetricAggregationType.Average }),
            ],
          },
        ],
      ]),
      upstreamNodeSpecifications: new Map(),
      edgeSpecification: {
        metricSpecifications: [
          expect.objectContaining({ metric: 'duration', aggregation: MetricAggregationType.Average }),
        ],
      },
    });
  });
});
