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
import { GraphQlFieldFilter } from '../../../../../public-api';

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
    key: 'edge-filter-metadata',
    type: {
      key: PLAIN_OBJECT_PROPERTY.type
    }
  })
  public edgeFilterMetadata?: TopologyEdgeFilterMetadata;

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
      const filtersAsFieldFilters = filters as GraphQlFieldFilter[];

      const edgeFilterEntityType = this.edgeFilterMetadata?.entityType;
      const edgeFilterFields = this.edgeFilterMetadata?.fields ?? [];
      const edgeFilters: GraphQlFieldFilter[] = filtersAsFieldFilters.filter(f =>
        edgeFilterFields.includes(typeof f.keyOrExpression === 'string' ? f.keyOrExpression : f.keyOrExpression.key)
      );
      const nodeFilters = filtersAsFieldFilters.filter(
        f =>
          !edgeFilterFields.includes(typeof f.keyOrExpression === 'string' ? f.keyOrExpression : f.keyOrExpression.key)
      );

      return {
        requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
        rootNodeType: this.entityType,
        rootNodeLimit: 100,
        rootNodeSpecification: rootEntitySpec,
        rootNodeFilters: nodeFilters,
        edgeSpecification: edgeSpec,
        edgeFilters: edgeFilters,
        upstreamNodeSpecifications: this.buildUpstreamSpecifications(
          edgeFilters.length > 0 ? edgeFilterEntityType : undefined
        ),
        downstreamNodeSpecifications: this.buildDownstreamSpecifications(
          edgeFilters.length > 0 ? edgeFilterEntityType : undefined
        ),
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

  private buildDownstreamSpecifications(
    edgeFilterEntityType?: string
  ): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(
      this.defaultedEntityTypeArray(this.downstreamEntityTypes)
        .filter(entityType => (edgeFilterEntityType === undefined ? true : entityType === edgeFilterEntityType))
        .map(type => [type, this.buildEntitySpec()])
    );
  }

  private buildUpstreamSpecifications(
    edgeFilterEntityType?: string
  ): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(
      this.defaultedEntityTypeArray(this.upstreamEntityTypes)
        .filter(entityType => (edgeFilterEntityType === undefined ? true : entityType === edgeFilterEntityType))
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

export interface TopologyEdgeFilterMetadata {
  entityType: string;
  fields: string[];
}
