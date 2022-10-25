import { RenderableTopology, RenderableTopologyNode, TopologyEdge, TopologyNode } from "../../topology";

export class GraphLayout {

  private readonly levelToNodesMap:  Map<number, RenderableTopologyNode[]>  = new Map<number, RenderableTopologyNode[]>([[0, []]]);
  private readonly nodeToLevelMap: Map<RenderableTopologyNode, number> = new Map<RenderableTopologyNode, number>();

  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {

    this.findRootNodes(topology);
    this.fillNodeAndLevelMaps();
    this.assignCoordinatesToNodes();
    this.verticallyCenterAlignNodes();
  }

  private findRootNodes(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    topology.nodes.forEach(node => {
      if (node.incoming.length === 0) {
        this.nodeToLevelMap.set(node, 0);
        this.levelToNodesMap.get(0)?.push(node);
      }
    });
  }

  private fillNodeAndLevelMaps(): void {

    const goingToBeExploredNodes = [...(this.levelToNodesMap.get(0) ?? [])];
    const goingToBeOrAlreadyExploredNodes = new Set<RenderableTopologyNode>([...goingToBeExploredNodes]);

    this.levelOrderTraversal(goingToBeExploredNodes, goingToBeOrAlreadyExploredNodes);
  }

  private levelOrderTraversal(goingToBeExploredNodes: RenderableTopologyNode[], goingToBeOrAlreadyExploredNodes: Set<RenderableTopologyNode>): void{
    if(goingToBeExploredNodes.length === 0) {
      return;
    }

    const currentNode = goingToBeExploredNodes.shift()!;
    const level = this.nodeToLevelMap.get(currentNode)! + 1;
    if(!this.levelToNodesMap.has(level)){
      this.levelToNodesMap.set(level, []);
    }

    currentNode.outgoing.forEach(edge => {
      const child = edge.target;
      if (!goingToBeOrAlreadyExploredNodes.has(child)) {
        goingToBeOrAlreadyExploredNodes.add(child);
        goingToBeExploredNodes.push(child);
        this.nodeToLevelMap.set(child, level);
        this.levelToNodesMap.get(level)?.push(child);
      }
    });

    this.levelOrderTraversal(goingToBeExploredNodes, goingToBeOrAlreadyExploredNodes);
  }

  private assignCoordinatesToNodes(): void {

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

  private verticallyCenterAlignNodes(): void {
    const longestLevelLength = Math.max(...Array.from(this.levelToNodesMap.values()).map(nodes => nodes.length));

    Array.from(this.levelToNodesMap.values()).forEach(nodes => {
      nodes.forEach(node => {
        node.y += (longestLevelLength - nodes.length) * ((node.renderedData()?.getBoudingBox()?.height ?? 36) + 20) / 2;
      })
    })
  }
}
