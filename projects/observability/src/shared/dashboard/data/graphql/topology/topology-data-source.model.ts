import { ArrayPropertyTypeInstance, EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlRequestCacheability, GraphQlRequestOptions } from '@hypertrace/graphql-client';
import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  PLAIN_OBJECT_PROPERTY
} from '@hypertrace/hyperdash';
import { uniq } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import {
  EntityNode,
  EntityTopologyGraphQlQueryHandlerService,
  ENTITY_TOPOLOGY_GQL_REQUEST,
  TopologyEdgeSpecification,
  TopologyNodeSpecification
} from '../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
import { TopologyMetricsData, TopologyMetricsModel } from './metrics/topology-metrics.model';
import { AttributeExpression, GraphQlFieldFilter } from '../../../../../public-api';

@Model({
  type: 'topology-data-source'
})
export class TopologyDataSourceModel extends GraphQlDataSourceModel<TopologyData> {
  @ModelProperty({
    key: 'entity',
    type: {
      key: ENUM_TYPE.type,
      values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api, ObservabilityEntityType.Backend]
    } as EnumPropertyTypeInstance,
    required: true
  })
  public entityType!: ObservabilityEntityType;

  @ModelProperty({
    key: 'upstream-entities',
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ENUM_TYPE.type,
        values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api]
      }
    } as ArrayPropertyTypeInstance
  })
  public upstreamEntityTypes?: ObservabilityEntityType[];

  @ModelProperty({
    key: 'downstream-entities',
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ENUM_TYPE.type,
        values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api, ObservabilityEntityType.Backend]
      }
    } as ArrayPropertyTypeInstance
  })
  public downstreamEntityTypes?: ObservabilityEntityType[];

  @ModelProperty({
    key: 'node-metrics',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TopologyMetricsModel
    } as ModelModelPropertyTypeInstance
  })
  public nodeMetricsModel!: TopologyMetricsModel;

  @ModelProperty({
    key: 'edge-metrics',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TopologyMetricsModel
    } as ModelModelPropertyTypeInstance
  })
  public edgeMetricsModel!: TopologyMetricsModel;

  @ModelProperty({
    key: 'edge-filter-config',
    type: {
      key: PLAIN_OBJECT_PROPERTY.type
    }
  })
  public edgeFilterConfig?: TopologyEdgeFilterConfig;

  private readonly specBuilder: SpecificationBuilder = new SpecificationBuilder();
  public readonly requestOptions: GraphQlRequestOptions = {
    cacheability: GraphQlRequestCacheability.Cacheable,
    isolated: true
  };
  public getData(): Observable<TopologyData> {
    const rootEntitySpec = this.buildEntitySpec();
    const edgeSpec = {
      metricSpecifications: this.getAllMetricSpecifications(this.edgeMetricsModel)
    };

    return this.query<EntityTopologyGraphQlQueryHandlerService>(filters => {
      const topologyFilters = this.getTopologyFilters(filters as GraphQlFieldFilter[]);
      const edgeFilterEntityType = this.edgeFilterConfig?.entityType;
      const requiredEdgeEntityTypes =
        topologyFilters.forEdge.length > 0 && edgeFilterEntityType !== undefined ? [edgeFilterEntityType] : undefined;

      return {
        requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
        rootNodeType: this.entityType,
        rootNodeLimit: 100,
        rootNodeSpecification: rootEntitySpec,
        rootNodeFilters: topologyFilters.forNode,
        edgeSpecification: edgeSpec,
        edgeFilters: topologyFilters.forEdge,
        upstreamNodeSpecifications: this.buildUpstreamSpecifications(requiredEdgeEntityTypes),
        downstreamNodeSpecifications: this.buildDownstreamSpecifications(requiredEdgeEntityTypes),
        timeRange: this.getTimeRangeOrThrow()
      };
    }, this.requestOptions).pipe(
      map(nodes => ({
        nodes: nodes,
        nodeSpecification: rootEntitySpec,
        edgeSpecification: edgeSpec,
        nodeTypes: uniq([
          this.entityType,
          ...this.defaultedEntityTypeArray(this.upstreamEntityTypes),
          ...this.defaultedEntityTypeArray(this.downstreamEntityTypes)
        ]),
        nodeMetrics: this.nodeMetricsModel,
        edgeMetrics: this.edgeMetricsModel
      }))
    );
  }

  private getTopologyFilters(filters: GraphQlFieldFilter[]): TopologyFilters {
    const edgeFilterFields = this.edgeFilterConfig?.fields ?? [];
    const edgeFilters: GraphQlFieldFilter[] = [];
    const nodeFilters: GraphQlFieldFilter[] = [];

    filters.forEach(fieldFilter => {
      if (edgeFilterFields.includes(this.getFieldFromExpression(fieldFilter.keyOrExpression))) {
        edgeFilters.push(fieldFilter);
      } else {
        nodeFilters.push(fieldFilter);
      }
    });

    return {
      forNode: nodeFilters,
      forEdge: edgeFilters
    };
  }

  private getFieldFromExpression(keyOrExpression: string | AttributeExpression): string {
    return typeof keyOrExpression === 'string' ? keyOrExpression : keyOrExpression.key;
  }

  /**
   * @param requiredEntityTypes If given, the function will return all the specs only for given required types
   */
  private buildDownstreamSpecifications(
    requiredEntityTypes?: string[]
  ): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(
      this.defaultedEntityTypeArray(this.downstreamEntityTypes)
        .filter(entityType => (requiredEntityTypes === undefined ? true : requiredEntityTypes.includes(entityType)))
        .map(type => [type, this.buildEntitySpec()])
    );
  }

  /**
   * @param requiredEntityTypes If given, the function will return all the specs only for given required types
   */
  private buildUpstreamSpecifications(
    requiredEntityTypes?: string[]
  ): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(
      this.defaultedEntityTypeArray(this.upstreamEntityTypes)
        .filter(entityType => (requiredEntityTypes === undefined ? true : requiredEntityTypes.includes(entityType)))
        .map(type => [type, this.buildEntitySpec()])
    );
  }

  private buildEntitySpec(): TopologyNodeSpecification {
    // TODO support different specs for different node types
    return {
      metricSpecifications: this.getAllMetricSpecifications(this.nodeMetricsModel),
      titleSpecification: this.specBuilder.attributeSpecificationForKey('name')
    };
  }

  private defaultedEntityTypeArray(
    typeArray: ObservabilityEntityType[] = [this.entityType]
  ): ObservabilityEntityType[] {
    return typeArray;
  }

  private getAllMetricSpecifications(metrics: TopologyMetricsModel): MetricAggregationSpecification[] {
    return [
      metrics.primary.specification,
      ...(metrics.secondary ? [metrics.secondary.specification] : []),
      ...(metrics.others ? metrics.others.map(_ => _.specification) : [])
    ];
  }
}

export interface TopologyData {
  nodes: EntityNode[];
  nodeTypes: ObservabilityEntityType[];
  nodeSpecification: TopologyNodeSpecification;
  edgeSpecification: TopologyEdgeSpecification;
  nodeMetrics: TopologyMetricsData;
  edgeMetrics: TopologyMetricsData;
}

export interface TopologyEdgeFilterConfig {
  entityType: string;
  fields: string[];
}

interface TopologyFilters {
  forNode: GraphQlFieldFilter[];
  forEdge: GraphQlFieldFilter[];
}
