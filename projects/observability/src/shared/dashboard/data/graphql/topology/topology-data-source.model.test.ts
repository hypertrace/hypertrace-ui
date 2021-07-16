import { Color, isEqualIgnoreFunctions } from '@hypertrace/common';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { GraphQlRequestCacheability, GraphQlRequestOptions } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import {
  ENTITY_TOPOLOGY_GQL_REQUEST,
  TopologyNodeSpecification
} from '../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { MetricAggregationSpecificationModel } from '../specifiers/metric-aggregation-specification.model';
import { TopologyMetricCategoryModel } from './metrics/topology-metric-category.model';
import { TopologyMetricWithCategoryModel } from './metrics/topology-metric-with-category.model';
import { TopologyMetricsModel } from './metrics/topology-metrics.model';
import { TopologyDataSourceModel } from './topology-data-source.model';

describe('topology data source model', () => {
  const specBuilder = new ObservabilitySpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: TopologyDataSourceModel;
  let lastEmittedQuery: unknown;
  let lastEmittedQueryRequestOption: GraphQlRequestOptions | undefined;

  const createCategoryModel = (
    name: string,
    minValue: number,
    fillColor: Color,
    strokeColor: Color,
    focusColor: Color,
    maxValue?: number
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
    categories: TopologyMetricCategoryModel[]
  ) => {
    const withCategoryModel = new TopologyMetricWithCategoryModel();
    withCategoryModel.specification = spec;
    withCategoryModel.categories = categories;

    return withCategoryModel;
  };

  const createTopologyMetricsModel = (metric: string, aggregation: MetricAggregationType) => {
    const primary = createMetricWithCategory(createSpecificationModel(metric, aggregation), [
      createCategoryModel(metric, 0, Color.Blue2, Color.Blue3, Color.Blue4, 10)
    ]);

    const metricsModel: TopologyMetricsModel = new TopologyMetricsModel();
    metricsModel.primary = primary;

    return metricsModel;
  };

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new TopologyDataSourceModel();
    model.downstreamEntityTypes = [ObservabilityEntityType.Api, ObservabilityEntityType.Backend];
    model.upstreamEntityTypes = [ObservabilityEntityType.Service];
    model.entityType = ObservabilityEntityType.Service;
    model.nodeMetricsModel = createTopologyMetricsModel('numCalls', MetricAggregationType.Average);
    model.edgeMetricsModel = createTopologyMetricsModel('duration', MetricAggregationType.Average);

    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => {
      lastEmittedQuery = query.buildRequest([]);
      lastEmittedQueryRequestOption = query.requestOptions;
    });
    model.getData();
  });

  test('builds expected request', () => {
    model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
        rootNodeType: ObservabilityEntityType.Service,
        rootNodeSpecification: {
          titleSpecification: specBuilder.attributeSpecificationForKey('name'),
          metricSpecifications: [specBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Average)]
        },
        rootNodeFilters: [],
        rootNodeLimit: 100,
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        downstreamNodeSpecifications: new Map<ObservabilityEntityType, TopologyNodeSpecification>([
          [
            ObservabilityEntityType.Api,
            {
              titleSpecification: specBuilder.attributeSpecificationForKey('name'),
              metricSpecifications: [specBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Average)]
            }
          ],
          [
            ObservabilityEntityType.Backend,
            {
              titleSpecification: specBuilder.attributeSpecificationForKey('name'),
              metricSpecifications: [specBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Average)]
            }
          ]
        ]),
        upstreamNodeSpecifications: new Map<ObservabilityEntityType, TopologyNodeSpecification>([
          [
            ObservabilityEntityType.Service,
            {
              titleSpecification: specBuilder.attributeSpecificationForKey('name'),
              metricSpecifications: [specBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Average)]
            }
          ]
        ]),
        edgeSpecification: {
          metricSpecifications: [specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)]
        }
      })
    ).toBe(true);

    expect(lastEmittedQueryRequestOption).toEqual({
      cacheability: GraphQlRequestCacheability.Cacheable,
      isolated: true
    });
  });
});
