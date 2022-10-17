import cytoscape from 'cytoscape';
import { cloneDeep } from 'lodash-es';
import { RenderableTopology, TopologyEdge, TopologyNode } from '../../topology';
import { TreeLayout } from './tree-layout';

export class CustomTreeLayout extends TreeLayout {
  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    const selfNode = topology.nodes.find(node => node.outgoing.length > 0);
    const selfLink = cloneDeep(selfNode?.outgoing[0]);

    if (selfLink && selfNode) {
      console.log('selfNode: ', selfNode);

      selfLink.source = selfNode;
      selfLink.target = topology.nodes[2];

      selfNode.outgoing.push(selfLink);
      topology.nodes[2].incoming.push(selfLink);
      topology.edges.push(selfLink);
    }

    console.log(topology);

    const edges = topology.edges.map(edge => ({
      data: { source: edge.source.userNode.data?.name!, target: edge.target.userNode.data?.name! }
    }));

    const rootHierarchyNode2 = cytoscape({
      elements: {
        nodes: topology.nodes.map(node => ({ data: { id: node.userNode.data?.name! } })),
        edges: edges
      },
      layout: {
        name: 'breadthfirst',
        spacingFactor: 300
      }
    });

    const graph: Elements = rootHierarchyNode2.json() as Elements;

    const map: Map<string, { x: number; y: number }> = new Map<string, { x: number; y: number }>(
      graph.elements.nodes.map(node => [node.data.id, { x: node.position.y + 455, y: node.position.x / 4 + 470 }])
    );

    topology.nodes.forEach(node => {
      node.x = map.get(node.userNode.data?.name!)!.x;
      node.y = map.get(node.userNode.data?.name!)!.y;
    });
  }
}

interface Elements {
  elements: {
    nodes: {
      data: { id: string };
      position: { x: number; y: number };
    }[];
  };
}
