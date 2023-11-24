import { RenderableTopology, RenderableTopologyNode, TopologyEdge, TopologyNode } from '../../topology';

export class GraphLayout {
  protected levelToNodesMap: Map<number, RenderableTopologyNode[]> = new Map<number, RenderableTopologyNode[]>([
    [0, []],
  ]);
  protected readonly nodeToLevelMap: Map<RenderableTopologyNode, number> = new Map<RenderableTopologyNode, number>();
  private readonly layoutConfig: TopologyGraphLayoutConfig = this.getLayoutConfig();

  public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    this.initialize();
    this.findRootNodes(topology);
    this.fillNodeAndLevelMaps();
    this.assignCoordinatesToNodes();
    this.verticallyCenterAlignNodes();
  }

  protected initialize(): void {
    this.levelToNodesMap = new Map([[0, []]]);
    this.nodeToLevelMap.clear();
  }

  protected findRootNodes(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {
    topology.nodes.forEach(node => {
      if (node.incoming.length === 0) {
        this.nodeToLevelMap.set(node, 0);
        this.levelToNodesMap.get(0)?.push(node);
      }
    });
  }

  protected fillNodeAndLevelMaps(): void {
    const goingToBeExploredNodes = [...(this.levelToNodesMap.get(0) ?? [])];
    const goingToBeOrAlreadyExploredNodes = new Set<RenderableTopologyNode>([...goingToBeExploredNodes]);

    this.levelOrderTraversal(goingToBeExploredNodes, goingToBeOrAlreadyExploredNodes);
  }

  protected levelOrderTraversal(
    goingToBeExploredNodes: RenderableTopologyNode[],
    goingToBeOrAlreadyExploredNodes: Set<RenderableTopologyNode>,
  ): void {
    if (goingToBeExploredNodes.length === 0) {
      return;
    }

    const currentNode = goingToBeExploredNodes.shift()!;
    const level = this.nodeToLevelMap.get(currentNode)! + 1;
    if (!this.levelToNodesMap.has(level)) {
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

  protected assignCoordinatesToNodes(): void {
    let curX = this.layoutConfig.startX;

    Array.from(this.levelToNodesMap.values()).forEach(nodes => {
      let curY = this.layoutConfig.startY;
      let maxWidth = 0;
      nodes.forEach(node => {
        node.x = curX;
        node.y = curY;
        curY +=
          (node.renderedData()?.getBoudingBox()?.height ?? this.layoutConfig.defaultNodeHeight) +
          this.layoutConfig.verticalNodeGap;
        maxWidth = Math.max(
          maxWidth,
          node.renderedData()?.getBoudingBox()?.width ?? this.layoutConfig.defaultNodeWidth,
        );
      });

      curX += maxWidth + this.layoutConfig.horizontalNodeGap;
    });
  }

  protected verticallyCenterAlignNodes(): void {
    const longestLevelLength = Math.max(...Array.from(this.levelToNodesMap.values()).map(nodes => nodes.length));

    Array.from(this.levelToNodesMap.values()).forEach(nodes => {
      nodes.forEach(node => {
        node.y +=
          ((longestLevelLength - nodes.length) *
            ((node.renderedData()?.getBoudingBox()?.height ?? this.layoutConfig.defaultNodeHeight) +
              this.layoutConfig.verticalNodeGap)) /
          2;
      });
    });
  }

  protected getLayoutConfig(): TopologyGraphLayoutConfig {
    return {
      horizontalNodeGap: 240,
      verticalNodeGap: 20,
      startX: 1,
      startY: 1,
      defaultNodeWidth: 240,
      defaultNodeHeight: 36,
    };
  }
}

export interface TopologyGraphLayoutConfig {
  horizontalNodeGap: number;
  verticalNodeGap: number;
  startX: number;
  startY: number;
  defaultNodeWidth: number;
  defaultNodeHeight: number;
}
