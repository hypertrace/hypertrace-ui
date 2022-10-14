import { hierarchy, HierarchyNode } from 'd3-hierarchy';
import { RenderableTopology, TopologyEdge, TopologyNode } from '../../topology';
import { D3ProxyNode, TreeLayout } from './tree-layout';
import cytoscape from 'cytoscape';

export class CustomTreeLayout extends TreeLayout {
  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    console.log(topology);
    // console.log(topology.nodes.map(node => node.userNode.data?.name));
    // var g = new dracula.Graph();
    const rootHierarchyNode = hierarchy(this.buildHierarchyProxyNodes(topology.nodes, { x: 0, y: 0 }));

    const rootHierarchyNode2 = cytoscape({
      elements: {
        nodes: topology.nodes.map(node => ({ data: { id: node.userNode.data?.name! } })),
        edges: topology.edges.map(edge => ({
          data: { source: edge.source.userNode.data?.name!, target: edge.target.userNode.data?.name! }
        }))
      },
      layout: {
        name: 'breadthfirst',
        avoidOverlap: true
      }
    });

    console.log(rootHierarchyNode);
    console.log(rootHierarchyNode2.json());

    const nodeWidth = this.getNodeWidth(rootHierarchyNode);
    const nodeHeight = this.getNodeHeight(rootHierarchyNode);

    this.updateLayout(rootHierarchyNode, 0, -1, nodeWidth * 1.2, nodeHeight * 1.2);

    // console.log(topology);
    console.log(rootHierarchyNode);
  }

  public updateLayout(
    hierarchyNode: HierarchyNode<D3ProxyNode>,
    nodeRowIndex: number,
    nodeColumnIndex: number,
    cellWidth: number,
    cellHeight: number
  ): number {
    if (hierarchyNode.data.sourceNode !== undefined) {
      hierarchyNode.data.sourceNode.x = nodeColumnIndex * cellWidth;
      hierarchyNode.data.sourceNode.y = nodeRowIndex * cellHeight;
    }

    hierarchyNode.children?.forEach((node, index) => {
      this.updateLayout(node, nodeRowIndex + index, nodeColumnIndex + 1, cellWidth, cellHeight);
    });

    return hierarchyNode.children?.length ?? 1;
  }
}
