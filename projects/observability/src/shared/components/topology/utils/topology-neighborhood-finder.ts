import { uniq } from 'lodash-es';
import { TopologyEdge, TopologyNeighborhood, TopologyNode } from '../topology';
import { TopologyGroupNodeUtil } from './topology-group-node.util';

export class TopologyNeighborhoodFinder {
  public neighborhoodForNode(node: TopologyNode): TopologyNeighborhood {
    return {
      nodes: uniq([
        node,
        ...node.edges.flatMap(edge => [edge.fromNode, edge.toNode]),
        ...(TopologyGroupNodeUtil.isTopologyGroupNode(node) && node.expanded ? node.children : []),
      ]),
      edges: [...node.edges],
    };
  }

  public neighborhoodForEdge(edge: TopologyEdge): TopologyNeighborhood {
    return {
      nodes: [edge.fromNode, edge.toNode],
      edges: [edge],
    };
  }

  public singleNodeNeighborhood(node: TopologyNode): TopologyNeighborhood {
    return {
      nodes: [node],
      edges: [],
    };
  }

  public emptyNeighborhood(): TopologyNeighborhood {
    return {
      nodes: [],
      edges: [],
    };
  }
}
