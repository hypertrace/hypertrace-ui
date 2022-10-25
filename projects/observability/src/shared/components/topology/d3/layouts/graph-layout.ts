import { RenderableTopology, RenderableTopologyNode, TopologyEdge, TopologyNode } from "../../topology";

export class GraphLayout {

  private levelToNodesMap = new Map<number, RenderableTopologyNode[]>([[0, []]]);
  private nodeToLevelMap = new Map<RenderableTopologyNode, number>();

  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {

    this.findRootNodes(topology);
    this.fillNodeAndLevelMaps();
    this.assignCoordinatesToNodes();
    this.verticallyCenterAlignNodes();
  }

  private findRootNodes(topology: RenderableTopology<TopologyNode, TopologyEdge>) {
    topology.nodes.forEach(node => {
      if (node.incoming.length === 0) {
        this.nodeToLevelMap.set(node, 0);
        this.levelToNodesMap.get(0)?.push(node);
      }
    });
  }

  private fillNodeAndLevelMaps() {

    const nodesThatAreGoingToBeExplored = [...(this.levelToNodesMap.get(0) ?? [])];
    const nodesThatHaveBeenOrAreGoingToBeExplored = new Set<RenderableTopologyNode>([...nodesThatAreGoingToBeExplored]);

    this.levelOrderTraversal(nodesThatAreGoingToBeExplored, nodesThatHaveBeenOrAreGoingToBeExplored);
  }

  private levelOrderTraversal(nodes: RenderableTopologyNode[], visited: Set<RenderableTopologyNode>): void{
    if(nodes.length === 0) {
      return;
    }

    const parent = nodes[0];
    nodes.shift();
    const level = this.nodeToLevelMap.get(parent)! + 1;
    if(!this.levelToNodesMap.has(level)){
      this.levelToNodesMap.set(level, []);
    }

    parent.outgoing.forEach(edge => {
      const child = edge.target;
      if (!visited.has(child)) {
        visited.add(child);
        nodes.push(child);
        this.nodeToLevelMap.set(child, level);
        this.levelToNodesMap.get(level)?.push(child);
      }
    });

    this.levelOrderTraversal(nodes, visited);
  }

  private assignCoordinatesToNodes() {

    let curX = 1;

    Array.from(this.levelToNodesMap.values()).forEach(nodes => {

      let curY = 1;
      let maxWidth = 0;
      nodes.forEach((node) => {
        node.x = curX;
        node.y = curY;
        curY += (node.renderedData()?.getBoudingBox()?.height ?? 36) + 20;
        maxWidth = Math.max(maxWidth, node.renderedData()?.getBoudingBox()?.width ?? 400);
      })

      curX += maxWidth + 240;
    });
  }

  private verticallyCenterAlignNodes() {
    const longestLevelLength = Math.max(...Array.from(this.levelToNodesMap.values()).map(nodes => nodes.length));

    Array.from(this.levelToNodesMap.values()).forEach(nodes => {
      nodes.forEach(node => {
        node.y += (longestLevelLength - nodes.length) * ((node.renderedData()?.getBoudingBox()?.height ?? 36) + 20) / 2;
      })
    })
  }
}
