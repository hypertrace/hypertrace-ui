import { Injectable, Renderer2 } from '@angular/core';
import { D3UtilService } from '../../../utils/d3/d3-util.service';
import {
  RenderableTopologyNode,
  RenderableTopologyNodeRenderedData,
  TopologyCoordinates,
  TopologyNode,
  TopologyNodeRenderer,
  TopologyNodeState
} from '../../topology';

@Injectable()
export class TopologyNodeRendererService implements TopologyNodeRenderer {
  private readonly rendererDelegates: TopologyNodeRendererDelegate[] = [];

  private readonly renderedNodeMap: WeakMap<RenderableTopologyNode, RenderedNodeInfo> = new WeakMap();

  public constructor(private readonly d3Utils: D3UtilService) {}

  public withDelegate(delegate: TopologyNodeRendererDelegate): this {
    this.rendererDelegates.push(delegate);

    return this;
  }

  public drawNode(parentElement: SVGSVGElement | SVGGElement, node: RenderableTopologyNode): void {
    const matchedDelegate = this.getMatchingDelegate(node.userNode);
    if (!matchedDelegate) {
      return;
    }

    const nodeElement = this.createNodeContainer(parentElement, node);
    matchedDelegate.draw(nodeElement, node.userNode, node.state, node.domElementRenderer);
    this.renderedNodeMap.set(node, {
      element: nodeElement,
      delegate: matchedDelegate
    });
    this.updateNodePosition(node);
  }

  public getRenderedNodeData(node: RenderableTopologyNode): RenderableTopologyNodeRenderedData | undefined {
    const matchedDelegate = this.getMatchingDelegate(node.userNode);
    if (!matchedDelegate) {
      return undefined;
    }

    return {
      getAttachmentPoint: angle =>
        this.mapNodeCoordinatesToTopologyCoordinates(matchedDelegate.getAttachmentPoint(angle, node.userNode), node),
      getBoudingBox: () => this.getBoundingBox(node, matchedDelegate)
    };
  }

  public updateNodePosition(node: RenderableTopologyNode): void {
    const renderedNode = this.renderedNodeMap.get(node);
    if (!renderedNode) {
      return;
    }

    const x = this.getBoundedX(node);
    const y = this.getBoundedY(node);
    this.d3Utils.select(renderedNode.element, node.domElementRenderer).attr('transform', `translate(${x}, ${y})`);
  }

  public updateNodeState(node: RenderableTopologyNode): void {
    const renderedNode = this.renderedNodeMap.get(node);
    if (!renderedNode) {
      return;
    }

    renderedNode.delegate.updateState(renderedNode.element, node.userNode, node.state, node.domElementRenderer);
  }

  public getElementForNode(node: RenderableTopologyNode): Element | undefined {
    const renderedNode = this.renderedNodeMap.get(node);

    return renderedNode && renderedNode.element;
  }

  public destroyNode(node: RenderableTopologyNode): void {
    const renderedNode = this.renderedNodeMap.get(node);
    if (!renderedNode) {
      return;
    }
    renderedNode.element.remove();
    renderedNode.delegate.destroy && renderedNode.delegate.destroy(node.userNode);
    this.renderedNodeMap.delete(node);
  }

  private createNodeContainer(host: SVGSVGElement | SVGGElement, node: RenderableTopologyNode): SVGGElement {
    return this.d3Utils.select(host, node.domElementRenderer).append('g').node()!;
  }

  private getBoundedX(node: RenderableTopologyNode): number {
    return node.x;
  }

  private getBoundedY(node: RenderableTopologyNode): number {
    return node.y;
  }

  private mapNodeCoordinatesToTopologyCoordinates(
    coordinates: TopologyCoordinates,
    node: RenderableTopologyNode
  ): TopologyCoordinates {
    return {
      x: coordinates.x + this.getBoundedX(node),
      y: coordinates.y + this.getBoundedY(node)
    };
  }

  private getMatchingDelegate(node: TopologyNode): TopologyNodeRendererDelegate | undefined {
    return this.rendererDelegates.find(delegate => delegate.matches(node));
  }

  private getBoundingBox(node: RenderableTopologyNode, delegate: TopologyNodeRendererDelegate): ClientRect {
    const width = delegate.width(node.userNode);
    const height = delegate.height(node.userNode);

    return {
      left: node.x,
      top: node.y,
      right: node.x + width,
      bottom: node.y + height,
      width: width,
      height: height
    };
  }
}

export interface TopologyNodeRendererDelegate<T extends TopologyNode = TopologyNode> {
  matches(node: TopologyNode): node is T;
  draw(parentElement: SVGGElement, node: T, state: TopologyNodeState, domElementRenderer: Renderer2): void;
  destroy?(node: T): void;
  updateState(parentElement: SVGGElement, node: T, state: TopologyNodeState, domElementRenderer: Renderer2): void;
  height(node: T): number;
  width(node: T): number;
  getAttachmentPoint(angleRad: number, node: T, isSource?: boolean): TopologyCoordinates;
}

interface RenderedNodeInfo {
  element: SVGGElement;
  delegate: TopologyNodeRendererDelegate;
}
