import { Key, MouseButton, throwIfNil, unionOfClientRects } from '@hypertrace/common';
import { brush, BrushBehavior, D3BrushEvent } from 'd3-brush';
// tslint:disable-next-line: no-restricted-globals weird tslint error. Rename event so we can type it and not mistake it for other events
import { event as _d3CurrentEvent, Selection } from 'd3-selection';
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { RenderableTopologyNode, RenderableTopologyNodeRenderedData } from '../../../topology';

export class TopologyZoom<TContainer extends Element = Element, TTarget extends Element = Element> {
  private static readonly DEFAULT_MIN_ZOOM: number = 0.2;
  private static readonly DEFAULT_MAX_ZOOM: number = 5.0;
  private static readonly DATA_BRUSH_CONTEXT_CLASS: string = 'brush-context';
  private static readonly DATA_BRUSH_OVERLAY_CLASS: string = 'overlay';
  private static readonly DATA_BRUSH_SELECTION_CLASS: string = 'selection';

  private static readonly DATA_BRUSH_OVERLAY_WIDTH: number = 200;
  private static readonly DATA_BRUSH_OVERLAY_HEIGHT: number = 200;
  private config?: TopologyZoomConfiguration<TContainer, TTarget>;
  private readonly zoomBehavior: ZoomBehavior<TContainer, unknown>;
  private readonly zoomChangeSubject: BehaviorSubject<number> = new BehaviorSubject(1);
  private readonly brushBehaviour: BrushBehavior<unknown>;
  public readonly zoomChange$: Observable<number> = this.zoomChangeSubject.asObservable();

  private get minScale(): number {
    return this.config && this.config.minScale !== undefined ? this.config.minScale : TopologyZoom.DEFAULT_MIN_ZOOM;
  }

  private get maxScale(): number {
    return this.config && this.config.maxScale !== undefined ? this.config.maxScale : TopologyZoom.DEFAULT_MAX_ZOOM;
  }

  private getCurrentD3Event<T extends ZoomHandlerEvent | ZoomSourceEvent>(): T {
    // Returned event type depends on where this is invoked. Filters get a source event.
    return _d3CurrentEvent;
  }

  public constructor() {
    this.zoomBehavior = zoom<TContainer, unknown>()
      .filter(() => this.checkValidZoomEvent(this.getCurrentD3Event()))
      .on('zoom', () => this.updateZoom(this.getCurrentD3Event<ZoomHandlerEvent>().transform))
      .on('start.drag', () => this.updateDraggingClassIfNeeded(this.getCurrentD3Event()))
      .on('end.drag', () => this.updateDraggingClassIfNeeded(this.getCurrentD3Event()));

    this.brushBehaviour = brush<unknown>().on('start end', () => this.onBrushSelection(_d3CurrentEvent));
  }

  public attachZoom(configuration: TopologyZoomConfiguration<TContainer, TTarget>): this {
    this.config = configuration;
    this.zoomBehavior.scaleExtent([this.minScale, this.maxScale]);
    this.config.container
      .call(this.zoomBehavior)
      // tslint:disable-next-line: no-null-keyword
      .on('dblclick.zoom', null); // Remove default double click handler

    return this;
  }

  public getZoomScale(): number {
    return this.zoomChangeSubject.getValue();
  }

  public setZoomScale(factor: number): void {
    this.zoomBehavior.scaleTo(this.getContainerSelectionOrThrow(), factor);
  }

  public resetZoom(): void {
    this.zoomBehavior.transform(this.getContainerSelectionOrThrow(), zoomIdentity);
  }

  public canIncreaseScale(): boolean {
    return this.maxScale > this.getZoomScale();
  }

  public canDecreaseScale(): boolean {
    return this.minScale < this.getZoomScale();
  }

  public zoomToFit(nodes: RenderableTopologyNode[]): void {
    const nodeClientRects = nodes
      .map(node => node.renderedData())
      .filter((renderedData): renderedData is RenderableTopologyNodeRenderedData => !!renderedData)
      .map(renderedData => renderedData.getBoudingBox());

    const requestedRect = unionOfClientRects(...nodeClientRects);
    const availableRect = throwIfNil(this.config && this.config.container.node()).getBoundingClientRect();
    // Add a bit of padding to requested width/height for padding
    const requestedWidthScale = availableRect.width / (requestedRect.width + 24);
    const requestedHeightScale = availableRect.height / (requestedRect.height + 24);
    // Zoomed in more than this is fine, but this is min to fit everything
    const minOverallScale = Math.min(requestedWidthScale, requestedHeightScale);
    // Never zoom beyond 100% with zoom to fit
    this.setZoomScale(Math.min(1, Math.max(this.minScale, minOverallScale)));
    this.translateToRect(requestedRect);
  }

  public panToTopLeft(nodes: RenderableTopologyNode[]): void {
    const nodeClientRects = nodes
      .map(node => node.renderedData())
      .filter((renderedData): renderedData is RenderableTopologyNodeRenderedData => !!renderedData)
      .map(renderedData => renderedData.getBoudingBox());

    this.setZoomScale(1);
    this.panToRect(unionOfClientRects(...nodeClientRects));
  }

  public panToRect(viewRect: ClientRect): void {
    const availableRect = throwIfNil(this.config && this.config.container.node()).getBoundingClientRect();
    // AvailableRect is used for width since we are always keeping scale as 1
    this.zoomBehavior.translateTo(
      this.getContainerSelectionOrThrow(),
      viewRect.left + availableRect.width / 2,
      viewRect.top + availableRect.height / 2
    );
  }

  public determineZoomScale(nodes: RenderableTopologyNode[], availableRect: ClientRect): number {
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

  public updateBrushOverlay(nodes: RenderableTopologyNode[]): void {
    const containerSelection = this.getContainerSelectionOrThrow();
    containerSelection.select(`.${TopologyZoom.DATA_BRUSH_CONTEXT_CLASS}`).remove();
    const containerdBox = throwIfNil(containerSelection.node()).getBoundingClientRect();

    const boundingBox: ClientRect = {
      bottom: containerdBox.bottom,
      top: containerdBox.height - TopologyZoom.DATA_BRUSH_OVERLAY_HEIGHT,
      left: containerdBox.width - TopologyZoom.DATA_BRUSH_OVERLAY_WIDTH,
      right: containerdBox.right,
      width: TopologyZoom.DATA_BRUSH_OVERLAY_WIDTH,
      height: TopologyZoom.DATA_BRUSH_OVERLAY_HEIGHT
    };
    const overlayZoomScale = this.determineZoomScale(nodes, boundingBox);
    this.brushBehaviour.extent([
      [0, 0],
      [
        TopologyZoom.DATA_BRUSH_OVERLAY_WIDTH / overlayZoomScale,
        TopologyZoom.DATA_BRUSH_OVERLAY_HEIGHT / overlayZoomScale
      ]
    ]);

    this.config!.brushOverlay = throwIfNil(this.config)
      .target.clone(true)
      .classed(TopologyZoom.DATA_BRUSH_CONTEXT_CLASS, true)
      .attr('width', boundingBox.width)
      .attr('height', boundingBox.height)
      .attr('transform', `translate(${boundingBox.left - 20}, ${boundingBox.top - 40}) scale(${overlayZoomScale})`)
      .insert('g', '.entity-edge')
      // tslint:disable-next-line: no-any
      .call(this.brushBehaviour as any);

    this.styleBrushSelection(this.config!.brushOverlay, overlayZoomScale);
  }

  private styleBrushSelection(
    brushSelection: Selection<SVGGElement, unknown, null, undefined>,
    overlayZoomScale: number
  ): void {
    // Map values
    const overlayBorderRadius = 4 / overlayZoomScale;
    const selectionBorderRadius = 4 / overlayZoomScale;
    const strokeWidth = 1 / overlayZoomScale;

    brushSelection
      .select(`.${TopologyZoom.DATA_BRUSH_OVERLAY_CLASS}`)
      .attr('rx', overlayBorderRadius)
      .attr('ry', overlayBorderRadius);

    brushSelection
      .select(`.${TopologyZoom.DATA_BRUSH_SELECTION_CLASS}`)
      .attr('rx', selectionBorderRadius)
      .attr('ry', selectionBorderRadius)
      .style('stroke-width', strokeWidth)
      .style('stroke-dasharray', `${strokeWidth}, ${strokeWidth}`);
  }

  private onBrushSelection(event: D3BrushEvent<RenderableTopologyNode>): void {
    if (!event.selection) {
      return;
    }

    const [start, end] = event.selection as [[number, number], [number, number]];
    if (isEqual(start, end)) {
      return;
    }
    const chartZoomScale = this.getZoomScale();
    const viewRect = {
      top: start[1] * chartZoomScale,
      left: start[0] * chartZoomScale,
      bottom: end[1] * chartZoomScale,
      right: end[0] * chartZoomScale,
      width: end[0] * chartZoomScale - start[0] * chartZoomScale,
      height: end[1] * chartZoomScale - start[1] * chartZoomScale
    };

    this.panToRect(viewRect);
  }

  private translateToRect(rect: ClientRect): void {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    this.zoomBehavior.translateTo(this.getContainerSelectionOrThrow(), centerX, centerY);
  }

  private updateZoom(transform: ZoomTransform): void {
    this.getTargetSelectionOrThrow().attr('transform', transform.toString());
    this.zoomChangeSubject.next(transform.k);
  }

  private checkValidZoomEvent(receivedEvent: ZoomSourceEvent): boolean {
    if (this.isScrollEvent(receivedEvent)) {
      return this.isValidTriggerEvent(receivedEvent, this.config && this.config.scroll);
    }
    if (this.isPrimaryMouseOrTouchEvent(receivedEvent)) {
      return this.isValidTriggerEvent(receivedEvent, this.config && this.config.pan);
    }

    return false;
  }

  private isValidTriggerEvent(
    receivedEvent: TouchEvent | MouseEvent,
    triggerConfig?: TopologyEventTriggerConfig
  ): boolean {
    if (!triggerConfig) {
      return false;
    }
    if (!triggerConfig.requireModifiers) {
      return true;
    }

    return triggerConfig.requireModifiers.some(key => this.eventHasModifier(receivedEvent, key));
  }

  private eventHasModifier(receivedEvent: TouchEvent | MouseEvent, modifier: ZoomEventKeyModifier): boolean {
    switch (modifier) {
      case Key.Control:
        return receivedEvent.ctrlKey;
      case Key.Meta:
        return receivedEvent.metaKey;
      default:
        return false;
    }
  }

  private isPrimaryMouseOrTouchEvent(receivedEvent: ZoomSourceEvent): receivedEvent is TouchEvent | MouseEvent {
    return (
      (window.TouchEvent && receivedEvent instanceof TouchEvent) ||
      (receivedEvent instanceof MouseEvent &&
        !this.isScrollEvent(receivedEvent) &&
        receivedEvent.button === MouseButton.Primary)
    );
  }

  private isScrollEvent(receivedEvent: ZoomSourceEvent): receivedEvent is WheelEvent {
    return receivedEvent instanceof WheelEvent;
  }

  private updateDraggingClassIfNeeded(zoomEvent: ZoomHandlerEvent): void {
    this.getContainerSelectionOrThrow().classed('dragging', this.isPanStartEvent(zoomEvent));
  }

  private isPanStartEvent(zoomEvent: ZoomHandlerEvent): boolean {
    return zoomEvent.type === 'start' && this.isPrimaryMouseOrTouchEvent(zoomEvent.sourceEvent);
  }

  private getTargetSelectionOrThrow(): Selection<TTarget, unknown, null, unknown> {
    return throwIfNil(this.config).target;
  }

  private getContainerSelectionOrThrow(): Selection<TContainer, unknown, null, unknown> {
    return throwIfNil(this.config).container;
  }
}

type ZoomEventKeyModifier = Key.Control | Key.Meta;
// Type ZoomSourceEventType = 'wheel' | 'mousedown' | 'mouseup' | 'mousemove';
type ZoomSourceEvent = MouseEvent | TouchEvent | null;
interface ZoomHandlerEvent extends D3ZoomEvent<Element, unknown> {
  sourceEvent: ZoomSourceEvent;
  type: 'start' | 'zoom' | 'end';
}

export interface TopologyZoomConfiguration<TContainer extends Element, TTarget extends Element> {
  container: Selection<TContainer, unknown, null, undefined>;
  target: Selection<TTarget, unknown, null, undefined>;
  brushOverlay?: Selection<SVGGElement, unknown, null, undefined>;
  scroll?: TopologyEventTriggerConfig;
  pan?: TopologyEventTriggerConfig;
  minScale?: number;
  maxScale?: number;
}

interface TopologyEventTriggerConfig {
  requireModifiers?: ZoomEventKeyModifier[];
}
