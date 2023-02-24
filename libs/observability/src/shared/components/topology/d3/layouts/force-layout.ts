import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  SimulationNodeDatum
} from 'd3-force';
import {
  RenderableTopology,
  RenderableTopologyEdge,
  RenderableTopologyNode,
  TopologyCoordinates,
  TopologyEdge,
  TopologyLayout,
  TopologyNode
} from '../../topology';
import { CustomForceBuilder } from './custom-force-builder';

export class ForceLayout implements TopologyLayout {
  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>, width: number, height: number): void {
    const xCenter = width / 2;
    const yCenter = height / 2;

    const proxyNodeMap = this.getProxyNodes(topology.nodes, { x: xCenter, y: yCenter });
    const proxyEdges = this.getProxyEdges(topology.edges, proxyNodeMap);
    const proxyNodes = Array.from(proxyNodeMap.values());
    const forceBuilder = new CustomForceBuilder();

    const simulation = forceSimulation()
      .stop()
      .force('x', forceX(xCenter).strength(0.15))
      .force('y', forceY(yCenter).strength(0.2)) // Give y force more strength as we're generally more constrained in that direction
      .force('center', forceCenter(xCenter, yCenter))
      .force('charge', forceManyBody().strength(-6000))
      .force(
        'collide',
        forceCollide<D3ProxyNode>()
          .radius(node => this.getCollisionRadiusForNode(node.sourceNode))
          .strength(1)
      )
      .force('link', forceLink(proxyEdges).distance(200))
      .force('edgeDirection', forceBuilder.buildEdgeDirectionalityForce(proxyEdges))
      .force('flatten', forceBuilder.buildStraightEdgeForce(proxyEdges))
      .nodes(proxyNodes);

    for (let i = 0; i < 100; i++) {
      simulation.tick();
    }

    proxyNodes.forEach(node => {
      node.sourceNode.x = node.x;
      node.sourceNode.y = node.y;
    });
  }

  private getProxyNodes(
    nodes: RenderableTopologyNode[],
    startingLocation: TopologyCoordinates
  ): Map<RenderableTopologyNode, D3ProxyNode> {
    return new Map(
      nodes.map(topologyNode => {
        const d3Node: D3ProxyNode = {
          sourceNode: topologyNode,
          ...startingLocation
        };

        return [topologyNode, d3Node];
      })
    );
  }

  private getCollisionRadiusForNode(node: RenderableTopologyNode): number {
    const renderedData = node.renderedData();
    if (!renderedData) {
      return 0;
    }
    const bbox = renderedData.getBoudingBox();

    return Math.max(bbox.width, bbox.height) / 2;
  }

  private getProxyEdges(
    edges: RenderableTopologyEdge[],
    nodeMap: Map<RenderableTopologyNode, D3ProxyNode>
  ): D3ProxyEdge[] {
    return edges.map(edge => ({
      source: nodeMap.get(edge.source)!,
      target: nodeMap.get(edge.target)!
    }));
  }
}

export interface D3ProxyNode extends SimulationNodeDatum {
  sourceNode: RenderableTopologyNode;
  x: number;
  y: number;
}

export interface D3ProxyEdge<TNode extends D3ProxyNode = D3ProxyNode> {
  source: TNode;
  target: TNode;
}
