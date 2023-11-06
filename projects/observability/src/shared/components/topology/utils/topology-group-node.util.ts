import { TopologyDragEvent } from '../d3/interactions/drag/topology-node-drag';
import {
  RenderableTopology,
  TopologyEdge,
  TopologyGroupNode,
  TopologyInternalNodeType,
  TopologyNode
} from '../topology';

export abstract class TopologyGroupNodeUtil {
  public static isTopologyGroupNode(node: TopologyNode): node is TopologyGroupNode {
    return (
      'nodeType' in node &&
      (node as TopologyNode & Partial<TopologyGroupNode>).nodeType === TopologyInternalNodeType.GroupNode
    );
  }

  public static getUpdatedNodesOnGroupNodeClick(
    userNode: TopologyGroupNode,
    userNodes: TopologyNode[]
  ): TopologyNode[] {
    const childNodes = userNode.children;
    userNode.expanded = !userNode.expanded;

    if (!userNode.expanded) {
      return userNodes.filter(n => !childNodes.includes(n));
    }

    return [userNodes, childNodes].flat();
  }

  public static updateLayoutForGroupNode(
    topology: RenderableTopology<TopologyNode, TopologyEdge>,
    groupNode: TopologyGroupNode
  ): void {
    const renderableGroupNode = topology.nodes.find(n => n.userNode === groupNode);
    const renderableChildNodes = topology.nodes.filter(n => groupNode.children.includes(n.userNode));
    const paddingLeft = 20;

    if (!renderableGroupNode) {
      return;
    }

    const boundingBox = renderableGroupNode.renderedData()?.getBoudingBox();
    if (!boundingBox) {
      return;
    }

    const nodesInPlane = topology.nodes.filter(
      n => !groupNode.children.includes(n.userNode) && n.x > boundingBox.left && n.x < boundingBox.right
    );
    const space = (boundingBox.height + 20) * groupNode.children.length;

    if (!groupNode.expanded) {
      nodesInPlane.forEach(n => (n.y = n.y - space));

      return;
    }

    if (renderableChildNodes.length === 0) {
      return;
    }

    let curY = boundingBox.bottom + 20;

    renderableChildNodes.forEach(childNode => {
      childNode.x = renderableGroupNode.x + paddingLeft;
      childNode.y = curY;
      curY += (childNode.renderedData()?.getBoudingBox()?.height ?? 36) + 20;
    });

    nodesInPlane.forEach(n => (n.y = n.y + space));
  }

  public static updateLayoutOnGroupNodeDrag(
    dragEvent: TopologyDragEvent,
    topologyData: RenderableTopology<TopologyNode, TopologyEdge>
  ): void {
    const userNode = dragEvent.node.userNode;
    if (this.isTopologyGroupNode(userNode)) {
      const childNodes = userNode.children;
      let curY = dragEvent.node.y + (dragEvent.node.renderedData()?.getBoudingBox()?.height ?? 36) + 20;

      topologyData.nodes.forEach(n => {
        if (childNodes.includes(n.userNode)) {
          n.x = 20 + dragEvent.node.x;
          n.y = curY;
          curY += (n.renderedData()?.getBoudingBox()?.height ?? 36) + 20;
        }
      });
    }
  }

  public static collapseGroupNodes(userNodes: TopologyNode[]): TopologyNode[] {
    const groupNodes = userNodes.filter((userNode): userNode is TopologyGroupNode =>
      this.isTopologyGroupNode(userNode)
    );
    let updatedNodes: TopologyNode[] = userNodes;

    groupNodes.forEach(groupNode => {
      const childNodes = groupNode.children;
      groupNode.expanded = false;
      updatedNodes = updatedNodes.filter(n => !childNodes.includes(n));
    });

    return updatedNodes;
  }
}
