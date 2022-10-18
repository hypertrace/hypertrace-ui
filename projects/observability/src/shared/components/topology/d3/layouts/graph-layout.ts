import { RenderableTopology, RenderableTopologyNode, TopologyCoordinates, TopologyEdge, TopologyNode } from "../../topology";

export class GraphLayout {
    public layout(topology: RenderableTopology<TopologyNode, TopologyEdge>): void {

        console.log('topology', topology);
    
        const levelToNodesMap = new Map<number, RenderableTopologyNode[]>();
        const nodeToLevelMap = new Map<RenderableTopologyNode, number>();
    
        // const selfNode = topology.nodes.find(node => node.outgoing.length > 0);
        // const selfLink = cloneDeep(selfNode?.outgoing[0]);
    
        // if (selfLink && selfNode) {
        //   console.log('selfNode: ', selfNode);
        //   selfLink.source = topology.nodes[2];
        //   selfLink.target = selfNode;
        //   selfNode.incoming.push(selfLink);
        //   topology.nodes[2].outgoing.push(selfLink);
        //   topology.edges.push(selfLink);
        // }
    
        // console.log(topology);
    
        topology.nodes.forEach(node => {
          if (node.incoming.length === 0) {
            nodeToLevelMap.set(node, 0);
            levelToNodesMap.has(0) ? levelToNodesMap.get(0)?.push(node) : levelToNodesMap.set(0, [node])
          }
        });
    
        const nodes: RenderableTopologyNode[] = levelToNodesMap.get(0) ?? []; 
        const vis = new Set<string>();
        let curr = 0;
    
        while(curr >= 0) {
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
          if(curr >= nodes.length) {
            break;
          }
        }
    
        console.log(levelToNodesMap);
    
        const map: Map<string, TopologyCoordinates> = new Map<string, TopologyCoordinates>();
    
        let curX = 1;
    
        Array.from(levelToNodesMap.keys()).forEach(level => {
          const nodes = levelToNodesMap.get(level)!;
    
          let curY = 1;
          let maxWidth = 0;
          nodes.forEach((node) => {
            map.set(node.userNode.data?.name!, { x: curX, y: curY });
            curY += (node.renderedData()?.getBoudingBox()?.height ?? 36) + 20;
            maxWidth = Math.max(maxWidth, node.renderedData()?.getBoudingBox()?.width ?? 400);
          })
    
          curX += maxWidth + 40;
        });
    
        topology.nodes.forEach(node => {
          node.x = map.get(node.userNode.data?.name!)!.x;
          node.y = map.get(node.userNode.data?.name!)!.y;
        });
  }
}
  