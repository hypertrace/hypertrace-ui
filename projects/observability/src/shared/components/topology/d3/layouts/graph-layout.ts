import { RenderableTopology, RenderableTopologyNode, TopologyCoordinates, TopologyEdge, TopologyNode } from "../../topology";

export class GraphLayout {
  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {

    const levelToNodesMap = new Map<number, RenderableTopologyNode[]>();
    const nodeToLevelMap = new Map<RenderableTopologyNode, number>();
    const nodeCoOrdinatesMap: Map<string, TopologyCoordinates> = new Map<string, TopologyCoordinates>();

    this.findRootNodes(topology, levelToNodesMap, nodeToLevelMap);
    this.fillNodeAndLevelMaps(levelToNodesMap, nodeToLevelMap);
    this.fillNodeCoOrdinatesMap(nodeCoOrdinatesMap, levelToNodesMap);
    this.setNodeCoOrdinates(topology, nodeCoOrdinatesMap);
  }

  private findRootNodes(topology: RenderableTopology<TopologyNode, TopologyEdge>, levelToNodesMap: Map<number, RenderableTopologyNode[]>, nodeToLevelMap: Map<RenderableTopologyNode, number>) {
    topology.nodes.forEach(node => {
      if (node.incoming.length === 0) {
        nodeToLevelMap.set(node, 0);
        levelToNodesMap.has(0) ? levelToNodesMap.get(0)?.push(node) : levelToNodesMap.set(0, [node])
      }
    });
  }

  private fillNodeAndLevelMaps(levelToNodesMap: Map<number, RenderableTopologyNode[]>, nodeToLevelMap: Map<RenderableTopologyNode, number>) {

    const nodes: RenderableTopologyNode[] = levelToNodesMap.get(0) ?? [];
    const vis = new Set<string>();
    let curr = 0;

    while (curr >= 0) {
      const parent = nodes[curr];
      const level = nodeToLevelMap.get(parent)! + 1;

      parent.outgoing.forEach(edge => {
        const child = edge.target;
        if (!vis.has(child.userNode.data?.name!)) {
          vis.add(child.userNode.data?.name!);
          nodes.push(child);
          nodeToLevelMap.set(child, level);
          levelToNodesMap.has(level) ? levelToNodesMap.get(level)?.push(child) : levelToNodesMap.set(level, [child]);
        }
      });

      curr++;
      if (curr >= nodes.length) {
        break;
      }
    }
  }

  private fillNodeCoOrdinatesMap(nodeCoOrdinatesMap: Map<string, TopologyCoordinates>, levelToNodesMap: Map<number, RenderableTopologyNode<TopologyNode>[]>) {
    let curX = 1;

    Array.from(levelToNodesMap.keys()).forEach(level => {
      const nodes = levelToNodesMap.get(level)!;

      let curY = 1;
      let maxWidth = 0;
      nodes.forEach((node) => {
        nodeCoOrdinatesMap.set(node.userNode.data?.name!, { x: curX, y: curY });
        curY += (node.renderedData()?.getBoudingBox()?.height ?? 36) + 20;
        maxWidth = Math.max(maxWidth, node.renderedData()?.getBoudingBox()?.width ?? 400);
      })

      curX += maxWidth + 240;
    });
  }

  private setNodeCoOrdinates(topology: RenderableTopology<TopologyNode, TopologyEdge>, nodeCoOrdinatesMap: Map<string, TopologyCoordinates>) {
    topology.nodes.forEach(node => {
      node.x = nodeCoOrdinatesMap.get(node.userNode.data?.name!)!.x;
      node.y = nodeCoOrdinatesMap.get(node.userNode.data?.name!)!.y;
    });
  }
}
