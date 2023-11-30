import { ArrayPropertyTypeInstance, EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlRequestCacheability, GraphQlRequestOptions } from '@hypertrace/graphql-client';
import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  PLAIN_OBJECT_PROPERTY,
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
  TopologyNodeSpecification,
} from '../../../../graphql/request/handlers/entities/query/topology/entity-topology-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
import { TopologyMetricsData, TopologyMetricsModel } from './metrics/topology-metrics.model';
import { GraphQlFieldFilter } from '../../../../graphql/model/schema/filter/field/graphql-field-filter';
import { AttributeExpression } from '../../../../graphql/model/attribute/attribute-expression';
import { GraphQlFilter } from '../../../../graphql/model/schema/filter/graphql-filter';
import { AttributeSpecificationModel, MetricAggregationSpecificationModel } from '../../../../../public-api';

@Model({
  type: 'topology-data-source',
})
export class TopologyDataSourceModel extends GraphQlDataSourceModel<TopologyData> {
  @ModelProperty({
    key: 'entity',
    type: {
      key: ENUM_TYPE.type,
      values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api, ObservabilityEntityType.Backend],
    } as EnumPropertyTypeInstance,
    required: true,
  })
  public entityType!: ObservabilityEntityType;

  @ModelProperty({
    key: 'upstream-entities',
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ENUM_TYPE.type,
        values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api],
      },
    } as ArrayPropertyTypeInstance,
  })
  public upstreamEntityTypes?: ObservabilityEntityType[];

  @ModelProperty({
    key: 'downstream-entities',
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ENUM_TYPE.type,
        values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api, ObservabilityEntityType.Backend],
      },
    } as ArrayPropertyTypeInstance,
  })
  public downstreamEntityTypes?: ObservabilityEntityType[];

  @ModelProperty({
    key: 'node-metrics',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TopologyMetricsModel,
    } as ModelModelPropertyTypeInstance,
  })
  public nodeMetricsModel!: TopologyMetricsModel;

  @ModelProperty({
    key: 'edge-metrics',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TopologyMetricsModel,
    } as ModelModelPropertyTypeInstance,
  })
  public edgeMetricsModel!: TopologyMetricsModel;

  @ModelProperty({
    key: 'edge-filter-config',
    type: {
      key: PLAIN_OBJECT_PROPERTY.type,
    },
  })
  public edgeFilterConfig?: TopologyEdgeFilterConfig;

  @ModelProperty({
    key: 'node-entity-specifications',
    type: {
      key: PLAIN_OBJECT_PROPERTY.type,
    },
  })
  public nodeEntitySpecifications?: Record<
    string,
    (MetricAggregationSpecificationModel | AttributeSpecificationModel)[]
  >;

  @ModelProperty({
    key: 'edge-entity-specifications',
    type: {
      key: PLAIN_OBJECT_PROPERTY.type,
    },
  })
  public edgeEntitySpecifications?: Record<
    string,
    (MetricAggregationSpecificationModel | AttributeSpecificationModel)[]
  >;

  private readonly specBuilder: SpecificationBuilder = new SpecificationBuilder();
  public readonly requestOptions: GraphQlRequestOptions = {
    cacheability: GraphQlRequestCacheability.Cacheable,
    isolated: true,
  };
  public getData(): Observable<TopologyData> {
    const rootEntitySpec = this.buildEntitySpec(this.entityType);
    const edgeSpec = {
      metricSpecifications: this.getAllMetricSpecifications(this.edgeMetricsModel),
    };

    return this.query<EntityTopologyGraphQlQueryHandlerService>(filters => {
      const topologyFilters = this.getTopologyFilters(filters);
      const edgeFilterEntityType = this.getRequiredEdgeEntityTypeFromFilters(filters);
      const requiredEdgeEntityTypes = edgeFilterEntityType !== undefined ? [edgeFilterEntityType] : undefined;

      return {
        requestType: ENTITY_TOPOLOGY_GQL_REQUEST,
        rootNodeType: this.entityType,
        rootNodeLimit: 100,
        rootNodeSpecification: rootEntitySpec,
        rootNodeFilters: topologyFilters.nodes,
        edgeSpecification: edgeSpec,
        edgeEntityFilters: topologyFilters.edges,
        upstreamNodeSpecifications: this.buildUpstreamSpecifications(requiredEdgeEntityTypes),
        downstreamNodeSpecifications: this.buildDownstreamSpecifications(requiredEdgeEntityTypes),
        timeRange: this.getTimeRangeOrThrow(),
        edgeEntitySpecifications: this.edgeEntitySpecifications
          ? new Map(Object.keys(this.edgeEntitySpecifications).map(key => [key, this.edgeEntitySpecifications![key]]))
          : undefined,
      };
    }, this.requestOptions).pipe(
      map(nodes => ({
        nodes: nodes,
        nodeSpecification: rootEntitySpec,
        edgeSpecification: edgeSpec,
        nodeTypes: uniq([
          this.entityType,
          ...this.defaultedEntityTypeArray(this.upstreamEntityTypes),
          ...this.defaultedEntityTypeArray(this.downstreamEntityTypes),
        ]),
        nodeMetrics: this.nodeMetricsModel,
        edgeMetrics: this.edgeMetricsModel,
      })),
    );
  }

  private getTopologyFilters(filters: GraphQlFilter[]): TopologyFilters {
    const edgeFilterFields = this.edgeFilterConfig?.entityConfigs.flatMap(info => info.fields) ?? [];
    const edgeFilters: Map<string, GraphQlFilter[]> = new Map();
    const nodeFilters: GraphQlFilter[] = [];

    filters.forEach(gqlFilter => {
      // Edge filter only supported for `GraphQlFieldFilter` for now
      const field = this.isFieldFilter(gqlFilter) ? this.getFieldFromExpression(gqlFilter.keyOrExpression) : '';
      if (edgeFilterFields.includes(field)) {
        const entityType =
          this.edgeFilterConfig?.entityConfigs.find(config => config.fields.includes(field))?.entityType ?? '';
        const filtersForEntity = [edgeFilters.get(entityType) ?? [], gqlFilter].flat();

        edgeFilters.set(entityType, filtersForEntity);
      } else {
        nodeFilters.push(gqlFilter);
      }
    });

    return {
      nodes: nodeFilters,
      edges: edgeFilters,
    };
  }

  private isFieldFilter(gqlFilter: GraphQlFilter): gqlFilter is GraphQlFieldFilter {
    return 'keyOrExpression' in gqlFilter && 'operator' in gqlFilter && 'value' in gqlFilter;
  }

  private getFieldFromExpression(keyOrExpression: string | AttributeExpression): string {
    return typeof keyOrExpression === 'string' ? keyOrExpression : keyOrExpression.key;
  }

  private getRequiredEdgeEntityTypeFromFilters(filters: GraphQlFilter[]): string | undefined {
    const fieldsForRequiredEntity =
      this.edgeFilterConfig?.entityConfigs.filter(config => config.required).flatMap(info => info.fields) ?? [];
    const gqlFilter = filters
      .filter((f): f is GraphQlFieldFilter => this.isFieldFilter(f))
      .find(f => fieldsForRequiredEntity.includes(this.getFieldFromExpression(f.keyOrExpression)));
    const field = gqlFilter ? this.getFieldFromExpression(gqlFilter.keyOrExpression) : '';

    return this.edgeFilterConfig?.entityConfigs.find(config => config.fields.includes(field))?.entityType;
  }

  /**
   * @param requiredEntityTypes If given, the function will return all the specs only for given required types
   */
  private buildDownstreamSpecifications(
    requiredEntityTypes?: string[],
  ): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(
      this.defaultedEntityTypeArray(this.downstreamEntityTypes)
        .filter(entityType => (requiredEntityTypes === undefined ? true : requiredEntityTypes.includes(entityType)))
        .map(type => [type, this.buildEntitySpec(type)]),
    );
  }

  /**
   * @param requiredEntityTypes If given, the function will return all the specs only for given required types
   */
  private buildUpstreamSpecifications(
    requiredEntityTypes?: string[],
  ): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    return new Map(
      this.defaultedEntityTypeArray(this.upstreamEntityTypes)
        .filter(entityType => (requiredEntityTypes === undefined ? true : requiredEntityTypes.includes(entityType)))
        .map(type => [type, this.buildEntitySpec(type)]),
    );
  }

  private buildEntitySpec(entityType: string): TopologyNodeSpecification {
    // TODO support different specs for different node types
    return {
      metricSpecifications: this.getAllMetricSpecifications(this.nodeMetricsModel),
      titleSpecification: this.specBuilder.attributeSpecificationForKey('name'),
      otherSpecifications: this.nodeEntitySpecifications?.[entityType] ?? [],
    };
  }

  private defaultedEntityTypeArray(
    typeArray: ObservabilityEntityType[] = [this.entityType],
  ): ObservabilityEntityType[] {
    return typeArray;
  }

  private getAllMetricSpecifications(metrics: TopologyMetricsModel): MetricAggregationSpecification[] {
    return [
      metrics.primary.specification,
      ...(metrics.secondary ? [metrics.secondary.specification] : []),
      ...(metrics.others ? metrics.others.map(_ => _.specification) : []),
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
  entityConfigs: TopologyEdgeEntityFilterConfig[];
}

interface TopologyEdgeEntityFilterConfig {
  entityType: string;
  fields: string[];
  // If `true` then only this entity's edge will be fetched given that filters from the `fields` are applied.
  required?: boolean;
}

interface TopologyFilters {
  nodes: GraphQlFilter[];
  edges: Map<string, GraphQlFilter[]>;
}
