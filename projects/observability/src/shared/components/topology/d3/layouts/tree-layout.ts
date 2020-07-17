import { hierarchy, HierarchyNode, HierarchyPointNode, tree } from 'd3-hierarchy';
import { first } from 'lodash-es';
import {
  RenderableTopology,
  RenderableTopologyNode,
  TopologyCoordinates,
  TopologyEdge,
  TopologyLayout,
  TopologyNode
} from '../../topology';

export class TreeLayout implements TopologyLayout {
  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    const rootHierarchyNode = hierarchy(this.buildHierarchyProxyNodes(topology.nodes, { x: 0, y: 0 }));

    const treeDataLevel0Node = tree<D3ProxyNode>()
      .nodeSize([this.getNodeHeight(rootHierarchyNode), this.getNodeWidth(rootHierarchyNode)])
      .separation(() => 1)(rootHierarchyNode);

    treeDataLevel0Node.children!.forEach(node =>
      this.updatePositions(node, node.y, this.getMinYPosition(treeDataLevel0Node))
    );
  }

  /**
   * yAdjustment is required to make (0,0) as the top left point
   */
  private updatePositions(
    hierarchyNode: HierarchyPointNode<D3ProxyNode>,
    level0XRootAdjustment: number,
    yAdjustment: number
  ): void {
    hierarchyNode.data.sourceNode!.x = hierarchyNode.y - level0XRootAdjustment;
    hierarchyNode.data.sourceNode!.y = hierarchyNode.x + Math.abs(yAdjustment);

    hierarchyNode.children &&
      hierarchyNode.children.forEach(node => this.updatePositions(node, level0XRootAdjustment, yAdjustment));
  }

  private getMinYPosition(hierarchyNode: HierarchyPointNode<D3ProxyNode>): number {
    return Math.min(hierarchyNode.x, ...(hierarchyNode.children ?? []).map(node => this.getMinYPosition(node)));
  }

  private buildHierarchyProxyNodes(
    nodes: RenderableTopologyNode[],
    startingLocation: TopologyCoordinates
  ): D3ProxyNode {
    const topologyHierarchyNodeMap = this.buildTopologyHierarchyNodeMap(nodes, startingLocation);

    // Build a new level 0 Root node for the data root nodes. This is required by tree layout
    const level0RootNode: D3ProxyNode = {
      sourceNode: undefined,
      hasIncomingEdges: false,
      children: [],
      x: 0,
      y: 0
    };

    topologyHierarchyNodeMap.forEach(d3Node => {
      if (!d3Node.hasIncomingEdges) {
        level0RootNode.children.push(d3Node);
      }
    });

    return level0RootNode;
  }

  private getNodeWidth(root: HierarchyNode<D3ProxyNode>): number {
    const leaf = first(root.leaves());
    let leafWidth = 240;

    if (leaf !== undefined) {
      const renderedData = leaf.data.sourceNode!.renderedData();

      if (renderedData !== undefined) {
        leafWidth = renderedData.getBoudingBox().width;
      }
    }

    return leafWidth + 160;
  }

  private getNodeHeight(root: HierarchyNode<D3ProxyNode>): number {
    return this.getRenderedNodeHeight(first(root.leaves()));
  }

  private getRenderedNodeHeight(node: HierarchyNode<D3ProxyNode> | undefined): number {
    const defaultNodeHeight = 36;

    if (node !== undefined) {
      const renderedData = node.data.sourceNode!.renderedData();

      if (renderedData !== undefined) {
        return renderedData.getBoudingBox().height;
      }
    }

    return defaultNodeHeight;
  }

  private buildTopologyHierarchyNodeMap(
    nodes: RenderableTopologyNode[],
    startingLocation: TopologyCoordinates
  ): Map<RenderableTopologyNode, D3ProxyNode> {
    const topologyHierarchyNodeMap = new Map(
      nodes.map(topologyNode => {
        topologyNode.x = startingLocation.x;
        topologyNode.y = startingLocation.y;

        const d3Node: D3ProxyNode = {
          sourceNode: topologyNode,
          ...startingLocation,
          children: [],
          hasIncomingEdges: false
        };

        return [topologyNode, d3Node];
      })
    );

    topologyHierarchyNodeMap.forEach((d3Node, topologyNode) => {
      this.removeSelfLinks(topologyNode);

      d3Node.children.push(
        ...topologyNode.outgoing
          .map(edge => edge.target)
          .map(node => topologyHierarchyNodeMap.get(node)!)
          .filter(mappedD3Node => !this.nodeIntroducesCycle(mappedD3Node))
          .map(mappedD3Node => {
            mappedD3Node.hasIncomingEdges = true;

            return mappedD3Node;
          })
      );
    });

    return topologyHierarchyNodeMap;
  }

  private nodeIntroducesCycle(node: D3ProxyNode): boolean {
    // TODO not great - we're doing this for each node (O(n^2)). Need to revisit layout to not piggy back off tree
    const visited = new Set<D3ProxyNode>();

    const searchForCycle = (searchNode: D3ProxyNode): boolean =>
      searchNode.children.some(child => {
        if (child === node) {
          return true;
        }
        if (visited.has(child)) {
          return false;
        }
        visited.add(child);

        return searchForCycle(child);
      });
    const returnVal = searchForCycle(node);

    return returnVal;
  }

  private removeSelfLinks(topologyNode: RenderableTopologyNode): void {
    topologyNode.incoming = topologyNode.incoming.filter(edge => edge.source !== edge.target);
    topologyNode.outgoing = topologyNode.outgoing.filter(edge => edge.source !== edge.target);
  }
}

interface D3ProxyNode {
  sourceNode: RenderableTopologyNode | undefined;
  hasIncomingEdges: boolean;
  children: D3ProxyNode[];
  x: number;
  y: number;
}
