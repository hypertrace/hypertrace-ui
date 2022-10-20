import { RenderableTopology, RenderableTopologyNode, TopologyCoordinates, TopologyEdge, TopologyNode } from "../../topology";

export class GraphLayout {

  private levelToNodesMap = new Map<number, RenderableTopologyNode[]>();
  private nodeToLevelMap = new Map<RenderableTopologyNode, number>();
  private nodeCoOrdinatesMap: Map<TopologyNode, TopologyCoordinates> = new Map<TopologyNode, TopologyCoordinates>();

  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {

    this.findRootNodes(topology);
    this.fillNodeAndLevelMaps();
    this.fillNodeCoOrdinatesMap();
    this.setNodeCoOrdinates(topology);
  }

  private findRootNodes(topology: RenderableTopology<TopologyNode, TopologyEdge>) {
    topology.nodes.forEach(node => {
      if (node.incoming.length === 0) {
        this.nodeToLevelMap.set(node, 0);
        this.levelToNodesMap.has(0) ? this.levelToNodesMap.get(0)?.push(node) : this.levelToNodesMap.set(0, [node])
      }
    });
  }

  private fillNodeAndLevelMaps() {

    const nodes = [...(this.levelToNodesMap.get(0) ?? [])];
    const visited = new Set<TopologyNode>([...nodes.map(node => node.userNode)]);

    while (nodes.length > 0) {
      const parent = nodes[0];
      const level = this.nodeToLevelMap.get(parent)! + 1;

      parent.outgoing.forEach(edge => {
        const child = edge.target;
        if (!visited.has(child.userNode)) {
          visited.add(child.userNode);
          nodes.push(child);
          this.nodeToLevelMap.set(child, level);
          this.levelToNodesMap.has(level) ? this.levelToNodesMap.get(level)?.push(child) : this.levelToNodesMap.set(level, [child]);
        }
      });

      nodes.shift();
    }
  }

  private fillNodeCoOrdinatesMap() {

    console.log(this.levelToNodesMap);

    let curX = 1;

    Array.from(this.levelToNodesMap.keys()).forEach(level => {
      const nodes = this.levelToNodesMap.get(level)!;

      let curY = 1;
      let maxWidth = 0;
      nodes.forEach((node) => {
        this.nodeCoOrdinatesMap.set(node.userNode, { x: curX, y: curY });
        curY += (node.renderedData()?.getBoudingBox()?.height ?? 36) + 20;
        maxWidth = Math.max(maxWidth, node.renderedData()?.getBoudingBox()?.width ?? 400);
      })

      curX += maxWidth + 240;
    });
  }

  private setNodeCoOrdinates(topology: RenderableTopology<TopologyNode, TopologyEdge>) {
    topology.nodes.forEach(node => {
      node.x = this.nodeCoOrdinatesMap.get(node.userNode)!.x;
      node.y = this.nodeCoOrdinatesMap.get(node.userNode)!.y;
    });
  }
}
