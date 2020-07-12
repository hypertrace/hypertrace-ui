import { Renderer2 } from '@angular/core';
import { TopologyStateManager } from '../d3/interactions/state/topology-state-manager';
import {
  RenderableTopology,
  RenderableTopologyEdge,
  RenderableTopologyNode,
  TopologyEdge,
  TopologyEdgeState,
  TopologyNode,
  TopologyNodeRenderer,
  TopologyNodeState
} from '../topology';

export class TopologyConverter {
  public convertTopology(
    nodes: TopologyNode[],
    stateManager: TopologyStateManager,
    nodeRenderer: TopologyNodeRenderer,
    domRenderer: Renderer2,
    oldTopology?: RenderableTopology<TopologyNode, TopologyEdge>
  ): RenderableTopology<TopologyNode, TopologyEdge> {
    const renderableNodeMap = this.buildRenderableNodeMap(
      nodes,
      stateManager,
      nodeRenderer,
      domRenderer,
      oldTopology && oldTopology.nodes
    );
    const uniqueEdges = this.findUniqueEdges(nodes);

    return {
      nodes: Array.from(renderableNodeMap.values()),
      edges: this.convertEdgesToRenderableEdges(uniqueEdges, renderableNodeMap, domRenderer, stateManager),
      neighborhood: {
        nodes: nodes,
        edges: uniqueEdges
      }
    };
  }

  private buildRenderableNodeMap(
    nodes: TopologyNode[],
    stateManager: TopologyStateManager,
    nodeRenderer: TopologyNodeRenderer,
    domRenderer: Renderer2,
    oldRenderableNodes: RenderableTopologyNode[] = []
  ): Map<TopologyNode, RenderableTopologyNode> {
    const oldNodeMap = new WeakMap(oldRenderableNodes.map(oldNode => [oldNode.userNode, oldNode]));
    const nodeMap = new Map<TopologyNode, RenderableTopologyNode>();

    nodes.forEach(userNode => {
      nodeMap.set(
        userNode,
        this.buildNewTopologyNode(
          userNode,
          stateManager.getNodeState(userNode),
          nodeRenderer,
          domRenderer,
          oldNodeMap.get(userNode)
        )
      );
    });

    return nodeMap;
  }

  private findUniqueEdges(nodes: TopologyNode[]): TopologyEdge[] {
    const sourceToTargetNodesMap = new WeakMap<TopologyNode, WeakSet<TopologyNode>>();
    const uniqueEdges: TopologyEdge[] = [];

    // Could just use set on the edges, but we're not going to assume they use the same objects in each node
    nodes.forEach(node => {
      node.edges.forEach(edge => {
        const targetNodes = sourceToTargetNodesMap.get(edge.fromNode) || new WeakSet();
        sourceToTargetNodesMap.set(edge.fromNode, targetNodes); // Put it back in case it was created new
        if (!targetNodes.has(edge.toNode)) {
          // New edge, haven't seen
          uniqueEdges.push(edge);
          targetNodes.add(edge.toNode);
        }
      });
    });

    return uniqueEdges;
  }

  private convertEdgesToRenderableEdges(
    edges: TopologyEdge[],
    nodeMap: Map<TopologyNode, RenderableTopologyNode>,
    domRenderer: Renderer2,
    stateManager: TopologyStateManager
  ): RenderableTopologyEdge[] {
    return edges.map(edge => {
      const sourceNode = nodeMap.get(edge.fromNode)!;
      const targetNode = nodeMap.get(edge.toNode)!;

      return this.buildNewTopologyEdge(edge, sourceNode, targetNode, stateManager.getEdgeState(edge), domRenderer);
    });
  }

  private buildNewTopologyNode(
    node: TopologyNode,
    state: TopologyNodeState,
    nodeRenderer: TopologyNodeRenderer,
    domRenderer: Renderer2,
    oldNode?: RenderableTopologyNode
  ): RenderableTopologyNode {
    const renderableNode = {
      incoming: [],
      outgoing: [],
      state: state,
      x: oldNode ? oldNode.x : 0,
      y: oldNode ? oldNode.y : 0,
      userNode: node,
      renderedData: () => nodeRenderer.getRenderedNodeData(renderableNode),
      domElementRenderer: domRenderer
    };

    return renderableNode;
  }

  private buildNewTopologyEdge(
    edge: TopologyEdge,
    sourceNode: RenderableTopologyNode,
    targetNode: RenderableTopologyNode,
    state: TopologyEdgeState,
    domElementRenderer: Renderer2
  ): RenderableTopologyEdge {
    const renderableEdge = {
      source: sourceNode,
      target: targetNode,
      userEdge: edge,
      state: state,
      domElementRenderer: domElementRenderer
    };

    sourceNode.outgoing.push(renderableEdge);
    targetNode.incoming.push(renderableEdge);

    return renderableEdge;
  }
}
