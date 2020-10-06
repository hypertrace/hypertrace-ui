import { isEqualIgnoreFunctions } from '@hypertrace/common';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { GraphQlRequestCacheability, GraphQlRequestOptions } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import {
  ENTITY_TOPOLOGY_GQL_REQUEST,
  TopologyNodeSpecification
} from '../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { TopologyDataSourceModel } from './topology-data-source.model';

describe('topology data source model', () => {
  const specBuilder = new ObservabilitySpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: TopologyDataSourceModel;
  let lastEmittedQuery: unknown;
  let lastEmittedQueryRequestOption: GraphQlRequestOptions | undefined;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new TopologyDataSourceModel();
    model.downstreamEntityTypes = [ObservabilityEntityType.Api, ObservabilityEntityType.Backend];
    model.upstreamEntityTypes = [ObservabilityEntityType.Service];
    model.entityType = ObservabilityEntityType.Service;
    model.nodeMetricSpecifications = [
      specBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Average)
    ];
    model.edgeMetricSpecifications = [
      specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)
    ];
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
