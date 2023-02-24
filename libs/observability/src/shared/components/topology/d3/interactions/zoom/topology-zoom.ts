import { throwIfNil, unionOfClientRects } from '@hypertrace/common';
import { D3Zoom } from '../../../../utils/d3/zoom/d3-zoom';
import { RenderableTopologyNode, RenderableTopologyNodeRenderedData } from '../../../topology';
import { D3ZoomConfiguration } from './../../../../utils/d3/zoom/d3-zoom';

export class TopologyZoom<TContainer extends Element = Element, TTarget extends Element = Element> extends D3Zoom<
  TContainer,
  TTarget
> {
  public zoomToFit(nodes: RenderableTopologyNode[]): void {
    const nodeClientRects = nodes
      .map(node => node.renderedData())
      .filter((renderedData): renderedData is RenderableTopologyNodeRenderedData => !!renderedData)
      .map(renderedData => renderedData.getBoudingBox());

    const requestedRect = unionOfClientRects(...nodeClientRects);

    this.zoomToRect(requestedRect);
  }

  public panToTopLeft(nodes: RenderableTopologyNode[]): void {
    const nodeClientRects = nodes
      .map(node => node.renderedData())
      .filter((renderedData): renderedData is RenderableTopologyNodeRenderedData => !!renderedData)
      .map(renderedData => renderedData.getBoudingBox());

    this.setZoomScale(1);
    this.panToRect(unionOfClientRects(...nodeClientRects));
  }

  private determineZoomScale(nodes: RenderableTopologyNode[], availableRect: ClientRect): number {
    const nodeClientRects = nodes
      .map(node => node.renderedData())
      .filter((renderedData): renderedData is RenderableTopologyNodeRenderedData => !!renderedData)
      .map(renderedData => renderedData.getBoudingBox());

    const requestedRect = unionOfClientRects(...nodeClientRects);
    // Add a bit of padding to requested width/height for padding
    const requestedWidthScale = availableRect.width / requestedRect.width;
    const requestedHeightScale = availableRect.height / requestedRect.height;
    // Zoomed in more than this is fine, but this is min to fit everything
    const minOverallScale = Math.min(requestedWidthScale, requestedHeightScale);

    return minOverallScale;
  }

  public updateBrushOverlayWithData(nodes: RenderableTopologyNode[]): void {
    const containerSelection = this.getContainerSelectionOrThrow();
    containerSelection.select(`.${TopologyZoom.DATA_BRUSH_CONTEXT_CLASS}`).remove();
    const containerdBox = throwIfNil(containerSelection.node())!.getBoundingClientRect();

    const boundingBox: ClientRect = {
      bottom: containerdBox.bottom,
      top: containerdBox.height - TopologyZoom.DATA_BRUSH_OVERLAY_HEIGHT,
      left: containerdBox.width - TopologyZoom.DATA_BRUSH_OVERLAY_WIDTH,
      right: containerdBox.right,
      width: TopologyZoom.DATA_BRUSH_OVERLAY_WIDTH,
      height: TopologyZoom.DATA_BRUSH_OVERLAY_HEIGHT
    };

    const overlayZoomScale = this.determineZoomScale(nodes, boundingBox);

    this.showBrushOverlay(overlayZoomScale);
  }
}

export interface TopologyZoomConfiguration<TContainer extends Element, TTarget extends Element>
  extends D3ZoomConfiguration<TContainer, TTarget> {}
