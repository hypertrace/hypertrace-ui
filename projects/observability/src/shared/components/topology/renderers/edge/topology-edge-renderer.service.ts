import { Injectable, Renderer2 } from '@angular/core';
import { distanceBetweenPoints, getVectorAngleRad } from '@hypertrace/common';
import { D3UtilService } from '../../../utils/d3/d3-util.service';
import { RenderableTopologyEdge, TopologyEdge, TopologyEdgeRenderer, TopologyEdgeState } from '../../topology';

@Injectable()
export class TopologyEdgeRendererService implements TopologyEdgeRenderer {
  private readonly rendererDelegates: TopologyEdgeRenderDelegate[] = [];

  private readonly rendererEdgeMap: WeakMap<RenderableTopologyEdge, RenderedEdgeInfo> = new WeakMap();

  public constructor(private readonly d3Utils: D3UtilService) {}

  public withDelegate(delegate: TopologyEdgeRenderDelegate): this {
    this.rendererDelegates.push(delegate);

    return this;
  }

  public drawEdge(parentElement: Element, edge: RenderableTopologyEdge): void {
    const matchedDelegate = this.getMatchingDelegate(edge.userEdge);
    const edgePosition = this.buildEdgePosition(edge);
    if (!matchedDelegate || !edgePosition) {
      return;
    }

    const edgeElement = this.createEdgeContainer(parentElement, edge.domElementRenderer);
    matchedDelegate.draw(edgeElement, edge.userEdge, edgePosition, edge.state, edge.domElementRenderer);
    this.rendererEdgeMap.set(edge, {
      element: edgeElement,
      delegate: matchedDelegate
    });
  }

  public updateEdgePosition(edge: RenderableTopologyEdge): void {
    const renderedInfo = this.rendererEdgeMap.get(edge);
    const edgePosition = this.buildEdgePosition(edge);
    if (!renderedInfo || !edgePosition) {
      return;
    }

    renderedInfo.delegate.updatePosition(renderedInfo.element, edge.userEdge, edgePosition, edge.domElementRenderer);
  }

  public updateEdgeState(edge: RenderableTopologyEdge): void {
    const renderedInfo = this.rendererEdgeMap.get(edge);
    if (!renderedInfo) {
      return;
    }

    renderedInfo.delegate.updateState(renderedInfo.element, edge.userEdge, edge.state, edge.domElementRenderer);
  }

  public destroyEdge(edge: RenderableTopologyEdge): void {
    const renderedInfo = this.rendererEdgeMap.get(edge);
    if (!renderedInfo) {
      return;
    }

    renderedInfo.element.remove();
    this.rendererEdgeMap.delete(edge);
  }

  public getElementForEdge(edge: RenderableTopologyEdge): Element | undefined {
    const renderedEdge = this.rendererEdgeMap.get(edge);

    return renderedEdge && renderedEdge.element;
  }

  private createEdgeContainer(host: Element, domRenderer: Renderer2): SVGGElement {
    return this.d3Utils.select(host, domRenderer).append('g').node()!;
  }

  private buildEdgePosition(edge: RenderableTopologyEdge): TopologyEdgePositionInformation | undefined {
    const sourceNodeRenderedData = edge.source.renderedData();
    const targetNodeRenderedData = edge.target.renderedData();
    if (!sourceNodeRenderedData || !targetNodeRenderedData) {
      return undefined;
    }

    const sourceRad = getVectorAngleRad(edge.source, edge.target);
    const targetRad = sourceRad + Math.PI;

    const sourceAttachPoint = sourceNodeRenderedData.getAttachmentPoint(sourceRad);
    const targetAttachPoint = targetNodeRenderedData.getAttachmentPoint(targetRad);

    // If points are very close, their attach points could be closer to partner. If so, flip
    if (distanceBetweenPoints(edge.source, sourceAttachPoint) > distanceBetweenPoints(edge.source, targetAttachPoint)) {
      return {
        source: targetAttachPoint,
        target: sourceAttachPoint
      };
    }

    return {
      source: sourceAttachPoint,
      target: targetAttachPoint
    };
  }

  private getMatchingDelegate(edge: TopologyEdge): TopologyEdgeRenderDelegate | undefined {
    return this.rendererDelegates.find(delegate => delegate.matches(edge));
  }
}

export interface TopologyEdgePositionInformation {
  source: {
    x: number;
    y: number;
  };
  target: {
    x: number;
    y: number;
  };
}

export interface TopologyEdgeRenderDelegate<T extends TopologyEdge = TopologyEdge> {
  matches(edge: TopologyEdge): edge is T;
  draw(
    parentElement: SVGGElement,
    edge: T,
    position: TopologyEdgePositionInformation,
    state: TopologyEdgeState,
    domRenderer: Renderer2
  ): void;
  updatePosition(
    parentElement: SVGGElement,
    edge: T,
    position: TopologyEdgePositionInformation,
    domRenderer: Renderer2
  ): void;
  updateState(parentElement: SVGGElement, edge: T, state: TopologyEdgeState, domRenderer: Renderer2): void;
}

interface RenderedEdgeInfo {
  element: SVGGElement;
  delegate: TopologyEdgeRenderDelegate;
}
