import cytoscape from 'cytoscape';
import { max } from 'lodash-es';
import { RenderableTopology, TopologyCoordinates, TopologyEdge, TopologyNode } from '../../topology';

export class CustomTreeLayout {
  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    const nodeHeight = max(topology.nodes.map(node => node.renderedData()?.getBoudingBox().height) ?? 36);
    const nodeWidth = max(topology.nodes.map(node => node.renderedData()?.getBoudingBox().width) ?? 400);

    const edges = topology.edges.map(edge => ({
      data: { source: edge.source.userNode.data?.name!, target: edge.target.userNode.data?.name! }
    }));

    const graph = cytoscape({
      elements: {
        nodes: topology.nodes.map(node => ({ data: { id: node.userNode.data?.name! } })),
        edges: edges
      },
      layout: {
        name: 'breadthfirst',
        avoidOverlap: true
      },
      style: [
        {
          selector: 'node',
          style: {
            height: nodeHeight,
            width: nodeWidth
          }
        }
      ],
      styleEnabled: true
    }).json() as Elements;

    const leftMostNodePosition = this.getLeftMostNodePosition(graph.elements.nodes);
    const lowestNodePosition = this.getLowestNodePosition(graph.elements.nodes);

    const map: Map<string, { x: number; y: number }> = new Map<string, { x: number; y: number }>(
      graph.elements.nodes.map(node => [
        node.data.id,
        this.getTranslatedPosition(node.position, leftMostNodePosition, lowestNodePosition)
      ])
    );

    topology.nodes.forEach(node => {
      node.x = map.get(node.userNode.data?.name!)!.x;
      node.y = map.get(node.userNode.data?.name!)!.y;
    });
  }

  private getLeftMostNodePosition(nodes: Node[]): TopologyCoordinates {
    let leftMostNode = nodes[0];
    nodes.forEach(node => {
      if (node.position.x < leftMostNode.position.x) {
        leftMostNode = node;
      }
    });

    return leftMostNode.position;
  }

  private getLowestNodePosition(nodes: Node[]): TopologyCoordinates {
    let lowestNode = nodes[0];
    nodes.forEach(node => {
      if (node.position.y < lowestNode.position.y) {
        lowestNode = node;
      }
    });

    return lowestNode.position;
  }

  private getTranslatedPosition(
    nodePosition: TopologyCoordinates,
    leftMostNodePosition: TopologyCoordinates,
    lowestNodePosition: TopologyCoordinates
  ): TopologyCoordinates {
    return { x: nodePosition.y - (lowestNodePosition.y - 1), y: nodePosition.x / 4 - (leftMostNodePosition.x / 4 - 1) };
  }
}

interface Elements {
  elements: {
    nodes: Node[];
  };
}

interface Node {
  data: { id: string };
  position: TopologyCoordinates;
}
