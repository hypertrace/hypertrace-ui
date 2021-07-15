import { ArrayPropertyTypeInstance, EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlDataSourceModel, SpecificationBuilder } from '@hypertrace/distributed-tracing';
import { GraphQlRequestCacheability, GraphQlRequestOptions } from '@hypertrace/graphql-client';
import { ARRAY_PROPERTY, Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { uniq } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import {
  EntityNode,
  EntityTopologyGraphQlQueryHandlerService,
  ENTITY_TOPOLOGY_GQL_REQUEST,
  TopologyEdgeSpecification,
  TopologyNodeSpecification
} from '../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { TopologyMetricsData, TopologyMetricsModel } from './metrics/topology-metrics.model';

@Model({
  type: 'topology-data-source'
})
export class TopologyDataSourceModel extends GraphQlDataSourceModel<TopologyData> {
  @ModelProperty({
    key: 'entity',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api, ObservabilityEntityType.Backend]
    } as EnumPropertyTypeInstance,
    required: true
  })
  public entityType!: ObservabilityEntityType;

  @ModelProperty({
    key: 'upstream-entities',
    // tslint:disable-next-line: no-object-literal-type-assertion
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
    // tslint:disable-next-line: no-object-literal-type-assertion
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
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TopologyMetricsModel
    } as ModelModelPropertyTypeInstance
  })
  public nodeMetricsModel!: TopologyMetricsModel;

  @ModelProperty({
    key: 'edge-metrics',
   // tslint:disable-next-line: no-object-literal-type-assertion
   type: {
    key: ModelPropertyType.TYPE,
    defaultModelClass: TopologyMetricsModel
  } as ModelModelPropertyTypeInstance
  })
  public edgeMetricsModel!: TopologyMetricsModel;

  private readonly specBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly requestOptions: GraphQlRequestOptions = {
    cacheability: GraphQlRequestCacheability.Cacheable,
    isolated: true
  };
  public getData(): Observable<TopologyData> {
    const rootEntitySpec = this.buildEntitySpec();
    const edgeSpec = {
      metricSpecifications: this.getAllMetricSpecifications(this.edgeMetricsModel)
    };

    return this.query<EntityTopologyGraphQlQueryHandlerService>(
      filters => ({
        requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
        rootNodeType: this.entityType,
        rootNodeLimit: 100,
        rootNodeSpecification: rootEntitySpec,
        rootNodeFilters: filters,
        edgeSpecification: edgeSpec,
        upstreamNodeSpecifications: this.buildUpstreamSpecifications(),
        downstreamNodeSpecifications: this.buildDownstreamSpecifications(),
        timeRange: this.getTimeRangeOrThrow()
      }),
      this.requestOptions
    ).pipe(
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

  private buildDownstreamSpecifications(): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(
      this.defaultedEntityTypeArray(this.downstreamEntityTypes).map(type => [type, this.buildEntitySpec()])
    );
  }

  private buildUpstreamSpecifications(): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(this.defaultedEntityTypeArray(this.upstreamEntityTypes).map(type => [type, this.buildEntitySpec()]));
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
