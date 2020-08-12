import { ArrayPropertyTypeInstance, EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlDataSourceModel, SpecificationBuilder } from '@hypertrace/distributed-tracing';
import { ARRAY_PROPERTY, Model, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
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
import { EntityMetricAggregationDataSourceModel } from '../entity/aggregation/entity-metric-aggregation-data-source.model';

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
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: EntityMetricAggregationDataSourceModel
      }
    } as ArrayPropertyTypeInstance
  })
  public nodeMetricSpecifications: MetricAggregationSpecification[] = [];

  @ModelProperty({
    key: 'edge-metrics',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: EntityMetricAggregationDataSourceModel
      }
    } as ArrayPropertyTypeInstance
  })
  public edgeMetricSpecifications: MetricAggregationSpecification[] = [];

  private readonly specBuilder: SpecificationBuilder = new SpecificationBuilder();
  public getData(): Observable<TopologyData> {
    const rootEntitySpec = this.buildEntitySpec();
    const edgeSpec = {
      metricSpecifications: this.edgeMetricSpecifications
    };

    return this.query<EntityTopologyGraphQlQueryHandlerService>(filters => ({
      requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
      rootNodeType: this.entityType,
      rootNodeLimit: 100,
      rootNodeSpecification: rootEntitySpec,
      rootNodeFilters: filters,
      edgeSpecification: edgeSpec,
      upstreamNodeSpecifications: this.buildUpstreamSpecifications(),
      downstreamNodeSpecifications: this.buildDownstreamSpecifications(),
      timeRange: this.getTimeRangeOrThrow()
    })).pipe(
      map(nodes => ({
        nodes: nodes,
        nodeSpecification: rootEntitySpec,
        edgeSpecification: edgeSpec,
        nodeTypes: uniq([
          this.entityType,
          ...this.defaultedEntityTypeArray(this.upstreamEntityTypes),
          ...this.defaultedEntityTypeArray(this.downstreamEntityTypes)
        ])
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
      metricSpecifications: this.nodeMetricSpecifications,
      titleSpecification: this.specBuilder.attributeSpecificationForKey('name')
    };
  }

  private defaultedEntityTypeArray(
    typeArray: ObservabilityEntityType[] = [this.entityType]
  ): ObservabilityEntityType[] {
    return typeArray;
  }
}

export interface TopologyData {
  nodes: EntityNode[];
  nodeTypes: ObservabilityEntityType[];
  nodeSpecification: TopologyNodeSpecification;
  edgeSpecification: TopologyEdgeSpecification;
}
