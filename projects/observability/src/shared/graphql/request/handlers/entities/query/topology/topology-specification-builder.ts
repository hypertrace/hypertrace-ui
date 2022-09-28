import { Dictionary } from '@hypertrace/common';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import { Specification } from '../../../../../model/schema/specifier/specification';
import { GraphQlObservabilityArgumentBuilder } from '../../../../builders/argument/graphql-observability-argument-builder';
import { GraphQlSelectionBuilder } from '../../../../builders/selections/graphql-selection-builder';

export class TopologySpecificationBuilder {
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();

  public buildNeighborSpecification(config: NeighborSpecificationBuildConfig): Specification {
    const alias = `${config.edgeDirection}_${config.neighborType}`;

    return {
      name: alias,
      resultAlias: () => alias,
      asGraphQlSelections: () => this.asGraphQlSelections(config, alias),
      extractFromServerData: serverData => serverData[alias],
      asGraphQlOrderByFragment: () => ({ expression: { key: '' } }) // Needed by the interface
    };
  }

  private asGraphQlSelections(config: NeighborSpecificationBuildConfig, alias: string): GraphQlSelection[] {
    return [
      {
        path: config.edgeDirection,
        alias: alias,
        arguments: [this.argBuilder.forNeighborType(config.neighborType)],
        children: [
          {
            path: 'results',
            children: [
              {
                path: 'neighbor',
                children: [{ path: 'id' }, ...this.selectionBuilder.fromSpecifications(config.nodeSpecifications)]
              }
            ]
          }
        ]
      }
    ];
  }
}

export interface NeighborSpecificationBuildConfig {
  edgeDirection: TopologyEdgeDirection;
  nodeSpecifications: Specification[];
  neighborType: string;
}

export interface TopologyNeighborSpecResult {
  results: {
    neighbor: Dictionary<unknown>;
  }[];
}

export const enum TopologyEdgeDirection {
  Incoming = 'incomingEdges',
  Outgoing = 'outgoingEdges'
}
