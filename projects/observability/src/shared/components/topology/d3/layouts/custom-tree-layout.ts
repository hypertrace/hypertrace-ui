import { hierarchy, HierarchyNode } from 'd3-hierarchy';
import { RenderableTopology, TopologyEdge, TopologyNode } from '../../topology';
import { D3ProxyNode, TreeLayout } from './tree-layout';

export class CustomTreeLayout extends TreeLayout {
  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    const rootHierarchyNode = hierarchy(this.buildHierarchyProxyNodes(topology.nodes, { x: 0, y: 0 }));

    const nodeWidth = this.getNodeWidth(rootHierarchyNode);
    const nodeHeight = this.getNodeHeight(rootHierarchyNode);

    this.updateLayout(rootHierarchyNode, 0, -1, nodeWidth * 1, nodeHeight);
  }

  private updateLayout(
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

    return (hierarchyNode.children?.length ?? 0) + 1;
  }
}
