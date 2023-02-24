import { Force } from 'd3-force';
import { D3ProxyEdge, D3ProxyNode } from './force-layout';

export class CustomForceBuilder<TNode extends D3ProxyNode, TEdge extends D3ProxyEdge<TNode>> {
  public buildEdgeDirectionalityForce(edges: TEdge[], strength: number = 1.2): Force<TNode, TEdge> {
    const sizeFactor = this.getTopologySizeFactor(edges, 1, 0.1);

    return alpha => edges.forEach(edge => this.applyDirectionalityToEdge(edge, alpha * sizeFactor * strength));
  }

  public buildStraightEdgeForce(edges: TEdge[], strength: number = 0.06): Force<TNode, TEdge> {
    const sizeFactor = this.getTopologySizeFactor(edges, 1, 0.1);

    return alpha => edges.forEach(edge => this.applyFlatteningForceToEdge(edge, alpha * sizeFactor * strength));
  }

  private applyDirectionalityToEdge(edge: TEdge, strength: number, desiredDistance: number = 100): void {
    const requiredTargetDx = Math.max(0, edge.source.x + desiredDistance - edge.target.x);
    if (requiredTargetDx > 0) {
      // Target should be to the right, if it needs to move let's update both source and target velocity
      this.changeNodeVelocity(edge.source, {
        deltaVx: -strength * this.getRelativeEdgeImportanceForSource(edge) * requiredTargetDx
      });
      this.changeNodeVelocity(edge.target, {
        deltaVx: strength * this.getRelativeEdgeImportanceForTarget(edge) * requiredTargetDx
      });
    }
  }

  private applyFlatteningForceToEdge(edge: TEdge, strength: number): void {
    const requiredSourceDy = edge.target.y - edge.source.y;
    this.changeNodeVelocity(edge.source, {
      deltaVy: strength * this.getRelativeEdgeImportanceForSource(edge) * requiredSourceDy
    });
    this.changeNodeVelocity(edge.target, {
      deltaVy: -strength * this.getRelativeEdgeImportanceForTarget(edge) * requiredSourceDy
    });
  }

  private changeNodeVelocity(node: TNode, change: { deltaVx?: number; deltaVy?: number }): void {
    const currentVxAsNumber = node.vx === undefined ? 0 : node.vx;
    const currentVyAsNumber = node.vy === undefined ? 0 : node.vy;

    node.vx = change.deltaVx === undefined ? node.vx : currentVxAsNumber + change.deltaVx;
    node.vy = change.deltaVy === undefined ? node.vy : currentVyAsNumber + change.deltaVy;
  }

  private getRelativeEdgeImportanceForSource(edge: TEdge): number {
    return 1 / edge.source.sourceNode.outgoing.length;
  }

  private getRelativeEdgeImportanceForTarget(edge: TEdge): number {
    return 1 / edge.target.sourceNode.incoming.length;
  }

  private getTopologySizeFactor(edges: TEdge[], smallTopologyValue: number, largeTopologyValue: number): number {
    const smallTopologyEdgeCount = 6; // Just playing around with some scaling here
    const largeTopologyEdgeCount = 24;

    if (edges.length < smallTopologyEdgeCount) {
      return smallTopologyValue;
    }

    if (edges.length > largeTopologyEdgeCount) {
      return largeTopologyValue;
    }

    const delta = largeTopologyValue - smallTopologyValue;

    return (
      smallTopologyValue +
      (delta * (edges.length - smallTopologyEdgeCount)) / (largeTopologyEdgeCount - smallTopologyEdgeCount)
    );
  }
}
