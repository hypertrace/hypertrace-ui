import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import {
  GlobalGraphQlFilterService,
  GraphQlFilter,
  GraphQlSelectionBuilder,
  GraphQlTimeRange,
  Specification,
  SpecificationBuilder
} from '@hypertrace/distributed-tracing';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { fromPairs } from 'lodash-es';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../../model/schema/entity';
import { GraphQlMetricAggregation } from '../../../../../model/schema/metric/graphql-metric-aggregation';
import { MetricAggregationSpecification } from '../../../../../model/schema/specifications/metric-aggregation-specification';
import { GraphQlObservabilityArgumentBuilder } from '../../../../builders/argument/graphql-observability-argument-builder';

@Injectable({ providedIn: 'root' })
export class EntityTopologyGraphQlQueryHandlerService
  implements GraphQlQueryHandler<GraphQlEntityTopologyRequest, EntityNode[]> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  private readonly specBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();
  public constructor(private readonly globalGraphQlFilterService: GlobalGraphQlFilterService) {}

  public matchesRequest(request: unknown): request is GraphQlEntityTopologyRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlEntityTopologyRequest>).requestType === ENTITY_TOPOLOGY_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlEntityTopologyRequest): GraphQlSelection {
    return {
      path: 'entities',
      arguments: [
        this.argBuilder.forScope(request.rootNodeType),
        this.argBuilder.forLimit(request.rootNodeLimit),
        this.argBuilder.forTimeRange(request.timeRange),
        ...this.argBuilder.forFilters(
          this.globalGraphQlFilterService.mergeGlobalFilters(request.rootNodeType, request.rootNodeFilters)
        )
      ],
      children: [
        {
          path: 'results',
          children: [
            ...this.buildTopologyNodeSelections(request.rootNodeSpecification, request.rootNodeType),
            ...this.convertNeighborSpecMap(EdgeDirection.Outgoing, request),
            ...this.convertNeighborSpecMap(EdgeDirection.Incoming, request)
          ]
        }
      ]
    };
  }

  private buildTopologyEdgeSelections(edgeSpec: TopologySpecification): GraphQlSelection[] {
    return this.selectionBuilder.fromSpecifications(edgeSpec.metricSpecifications);
  }

  private buildTopologyNodeSelections(
    nodeSpec: TopologyNodeSpecification,
    entityType: ObservabilityEntityType
  ): GraphQlSelection[] {
    return [
      { path: 'id' },
      ...this.selectionBuilder.fromSpecifications([nodeSpec.titleSpecification]),
      ...this.selectionBuilder.fromSpecifications(this.buildEntityTypeSpecificSpecs(entityType)),
      ...this.selectionBuilder.fromSpecifications(nodeSpec.metricSpecifications)
    ];
  }

  private convertNeighborSpecMap(
    edgeDirection: EdgeDirection,
    request: GraphQlEntityTopologyRequest
  ): GraphQlSelection[] {
    return Array.from(this.getSpecMapForDirection(edgeDirection, request).entries()).map(([entityType, spec]) => ({
      path: this.getEdgeQueryKey(edgeDirection),
      alias: this.buildEdgeAlias(edgeDirection, entityType),
      arguments: [this.argBuilder.forNeighborType(entityType)],
      children: [
        {
          path: 'results',
          children: [
            ...this.buildTopologyEdgeSelections(request.edgeSpecification),
            {
              path: 'neighbor',
              children: this.buildTopologyNodeSelections(spec, entityType)
            }
          ]
        }
      ]
    }));
  }

  private buildEdgeAlias(edgeDirection: EdgeDirection, neighborType: ObservabilityEntityType): string {
    return `${this.getEdgeQueryKey(edgeDirection)}_${neighborType}`;
  }

  private getEdgeQueryKey(edgeDirection: EdgeDirection): string {
    switch (edgeDirection) {
      case EdgeDirection.Incoming:
        return `incomingEdges`;
      case EdgeDirection.Outgoing:
        return `outgoingEdges`;
      default:
        throw Error(`Unsupported edge direction: ${edgeDirection}`);
    }
  }

  private getSpecMapForDirection(
    edgeDirection: EdgeDirection,
    request: GraphQlEntityTopologyRequest
  ): Map<ObservabilityEntityType, TopologyNodeSpecification> {
    switch (edgeDirection) {
      case EdgeDirection.Incoming:
        return request.upstreamNodeSpecifications;
      case EdgeDirection.Outgoing:
        return request.downstreamNodeSpecifications;
      default:
        throw Error(`Unsupported edge direction: ${edgeDirection}`);
    }
  }

  public convertResponse(response: TopologyServerResponse, request: GraphQlEntityTopologyRequest): EntityNode[] {
    return this.convertToEntityNodes(request, response.results);
  }

  private convertToEntityNodes(
    request: GraphQlEntityTopologyRequest,
    serverEntities: TopologyEntityWithEdges[]
  ): EntityNode[] {
    const nodeMap = new Map<string, EntityNode>();

    serverEntities.forEach(entity => {
      const node = this.getOrCreateNode(request.rootNodeType, request.rootNodeSpecification, nodeMap, entity);
      this.buildEdges(EdgeDirection.Incoming, entity, node, nodeMap, request).forEach(edge =>
        this.addEdgeToEachNodesEdgeArrayIfMissing(edge)
      );
      this.buildEdges(EdgeDirection.Outgoing, entity, node, nodeMap, request).forEach(edge =>
        this.addEdgeToEachNodesEdgeArrayIfMissing(edge)
      );
    });

    return Array.from(nodeMap.values());
  }

  private getOrCreateNode(
    entityType: ObservabilityEntityType,
    nodeSpec: TopologyNodeSpecification,
    nodeMap: Map<string, EntityNode>,
    serverEntity: TopologyEntity
  ): EntityNode {
    if (nodeMap.has(serverEntity.id)) {
      return nodeMap.get(serverEntity.id)!;
    }

    const newNode = {
      edges: [],
      specification: nodeSpec,
      data: this.buildEntity(entityType, serverEntity, nodeSpec)
    };

    nodeMap.set(serverEntity.id, newNode);

    return newNode;
  }

  private buildEntity(
    entityType: ObservabilityEntityType,
    serverResult: TopologyEntity,
    nodeSpec: TopologyNodeSpecification
  ): Entity {
    return {
      [entityIdKey]: serverResult.id,
      [entityTypeKey]: entityType,
      ...this.extractSpecsFromServerResult(
        [
          nodeSpec.titleSpecification,
          ...nodeSpec.metricSpecifications,
          ...this.buildEntityTypeSpecificSpecs(entityType)
        ],
        serverResult
      )
    };
  }

  private buildEdge(
    direction: EdgeDirection,
    node: EntityNode,
    neighborNode: EntityNode,
    serverEdge: TopologyEdge,
    edgeSpec: TopologySpecification
  ): EntityEdge {
    return {
      fromNode: direction === EdgeDirection.Outgoing ? node : neighborNode,
      toNode: direction === EdgeDirection.Incoming ? node : neighborNode,
      specification: edgeSpec,
      data: this.extractSpecsFromServerResult(edgeSpec.metricSpecifications, serverEdge)
    };
  }

  private buildEdges(
    direction: EdgeDirection,
    severEntity: TopologyEntityWithEdges,
    node: EntityNode,
    nodeMap: Map<string, EntityNode>,
    request: GraphQlEntityTopologyRequest
  ): EntityEdge[] {
    return Array.from(this.getSpecMapForDirection(direction, request).entries()).flatMap(
      ([neighborType, neighborSpec]) => {
        const edges = severEntity[this.buildEdgeAlias(direction, neighborType)].results;

        return edges.map(edge => {
          const neighborNode = this.getOrCreateNode(neighborType, neighborSpec, nodeMap, edge.neighbor);

          return this.buildEdge(direction, node, neighborNode, edge, request.edgeSpecification);
        });
      }
    );
  }

  private addEdgeToEachNodesEdgeArrayIfMissing(edge: EntityEdge): void {
    if (!this.nodeContainsEdge(edge.fromNode, edge)) {
      edge.fromNode.edges.push(edge);
    }
    if (!this.nodeContainsEdge(edge.toNode, edge)) {
      edge.toNode.edges.push(edge);
    }
  }

  private nodeContainsEdge(node: EntityNode, edge: EntityEdge): boolean {
    return !!node.edges.find(
      existingEdge => existingEdge.fromNode === edge.fromNode && existingEdge.toNode === edge.toNode
    );
  }

  private extractSpecsFromServerResult(
    specifications: Specification[],
    serverResult: TopologyEntity | TopologyEdge
  ): Dictionary<unknown> {
    return fromPairs(specifications.map(spec => [spec.resultAlias(), spec.extractFromServerData(serverResult)]));
  }

  private buildEntityTypeSpecificSpecs(entityType: ObservabilityEntityType): Specification[] {
    switch (entityType) {
      case ObservabilityEntityType.Backend:
        return [this.specBuilder.attributeSpecificationForKey('type')];
      default:
        return [];
    }
  }
}

export const ENTITY_TOPOLOGY_GQL_REQUEST = Symbol('GraphQL Entity Topology Request');

export interface GraphQlEntityTopologyRequest {
  requestType: typeof ENTITY_TOPOLOGY_GQL_REQUEST;
  timeRange: GraphQlTimeRange;
  rootNodeType: ObservabilityEntityType;
  rootNodeSpecification: TopologyNodeSpecification;
  rootNodeFilters?: GraphQlFilter[];
  rootNodeLimit: number; // TODO should downstream/upstream nodes of same type match root spec?
  downstreamNodeSpecifications: Map<ObservabilityEntityType, TopologyNodeSpecification>;
  upstreamNodeSpecifications: Map<ObservabilityEntityType, TopologyNodeSpecification>;
  edgeSpecification: TopologySpecification;
}

interface TopologySpecification {
  metricSpecifications: MetricAggregationSpecification[];
}

export type TopologyEdgeSpecification = TopologySpecification;

export interface TopologyNodeSpecification extends TopologySpecification {
  titleSpecification: Specification;
}

export interface EntityNode {
  edges: EntityEdge[];
  data: Entity;
  specification: TopologyNodeSpecification;
}

export interface EntityEdge {
  data: Dictionary<unknown>;
  specification: TopologyEdgeSpecification;
  fromNode: EntityNode;
  toNode: EntityNode;
}

interface TopologyServerResponse {
  results: TopologyEntityWithEdges[];
}

type TopologyEntity = { id: string } & Dictionary<unknown> & Dictionary<Dictionary<GraphQlMetricAggregation>>;

type TopologyEntityWithEdges = TopologyEntity & Dictionary<TopologyEdgeContainer>;

interface TopologyEdgeContainer {
  results: TopologyEdge[];
}

type TopologyEdge = { neighbor: TopologyEntity } & Dictionary<Dictionary<GraphQlMetricAggregation>>;

const enum EdgeDirection {
  Outgoing,
  Incoming
}
