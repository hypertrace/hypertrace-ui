import { ElementRef, Renderer2 } from '@angular/core';
import { DeepReadonly } from '@hypertrace/common';
import { Observable } from 'rxjs';

export interface Topology {
  draw(): this;
  destroy(): void;
}

export interface TopologyConfiguration {
  /**
   * If true, the nodes can be interactively moved via mouse drag.
   * Default: true
   */
  draggableNodes: boolean;

  /**
   * If true, the nodes will emphasize nearest neighbors on hover.
   * Default: true
   */
  hoverableNodes: boolean;

  /**
   * If true, the edges will emphasize the connected nodes on hover.
   * Default: true
   */
  hoverableEdges: boolean;

  /**
   * If true, clicking a node will trigger hover behavior until the next click.
   * TODO: make click and hover behavior configurable externally
   */
  clickableNodes: boolean;

  /**
   * If true, clicking an edge will trigger hover behavior until the next click.
   * TODO: make click and hover behavior configurable externally
   */
  clickableEdges: boolean;

  /**
   * If true, the topology supports zooming in and out.
   * Default: true
   */
  zoomable: boolean;

  /**
   * A list of specifiers for node data. Up to one will be selectable to the user,
   * and provided to the node renderer.
   */
  nodeDataSpecifiers: TopologyDataSpecifier[];

  /**
   * A list of specifiers for edge data. Up to one will be selectable to the user,
   * and provided to the edge renderer.
   */
  edgeDataSpecifiers: TopologyDataSpecifier[];

  /**
   * Nodes to render
   */
  nodes: TopologyNode[];

  /**
   * Renderers to use for nodes
   */
  nodeRenderer: TopologyNodeRenderer;

  /**
   * Renderer to use for edges
   */
  edgeRenderer: TopologyEdgeRenderer;

  /**
   * Used to render tooltips. If not provided, no tooltips are rendered.
   */
  tooltipRenderer?: TopologyTooltipRenderer;
}

export interface TopologyNode {
  edges: TopologyEdge[];
}

export interface TopologyEdge {
  fromNode: TopologyNode;
  toNode: TopologyNode;
}

export interface TopologyNeighborhood {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface TopologyNodeRenderer {
  drawNode(parentElement: SVGSVGElement | SVGGElement, node: RenderableTopologyNode): void;
  getRenderedNodeData(node: RenderableTopologyNode): RenderableTopologyNodeRenderedData | undefined;
  updateNodePosition(node: RenderableTopologyNode): void;
  updateNodeState(node: RenderableTopologyNode): void;
  getElementForNode(node: RenderableTopologyNode): Element | undefined;
  destroyNode(node: RenderableTopologyNode): void;
}

export interface TopologyEdgeRenderer {
  drawEdge(parentElement: SVGSVGElement | SVGGElement, edge: RenderableTopologyEdge): void;
  updateEdgePosition(edge: RenderableTopologyEdge): void;
  updateEdgeState(edge: RenderableTopologyEdge): void;
  getElementForEdge(edge: RenderableTopologyEdge): Element | undefined;
  destroyEdge(edge: RenderableTopologyEdge): void;
}

export interface RenderableTopology<TNode extends TopologyNode, TEdge extends TopologyEdge> {
  nodes: RenderableTopologyNode<TNode>[];
  edges: RenderableTopologyEdge<TEdge>[];
  neighborhood: TopologyNeighborhood;
}

export interface RenderableTopologyNode<TNode extends TopologyNode = TopologyNode> extends TopologyCoordinates {
  incoming: RenderableTopologyEdge[];
  outgoing: RenderableTopologyEdge[];
  state: TopologyNodeState;
  userNode: TNode;
  domElementRenderer: Renderer2;
  renderedData(): RenderableTopologyNodeRenderedData | undefined;
}

export interface RenderableTopologyNodeRenderedData {
  getAttachmentPoint(angleRad: number): TopologyCoordinates;
  getBoudingBox(): ClientRect;
}

export interface RenderableTopologyEdge<
  TEdge extends TopologyEdge = TopologyEdge,
  TNode extends TopologyNode = TopologyNode
> {
  source: RenderableTopologyNode<TNode>;
  target: RenderableTopologyNode<TNode>;
  state: TopologyEdgeState;
  userEdge: TEdge;
  domElementRenderer: Renderer2;
}

export interface TopologyCoordinates {
  x: number;
  y: number;
}

export interface TopologyLayout {
  layout(topology: RenderableTopology<TopologyNode, TopologyEdge>, width: number, height: number): void;
}

interface TopologyElementState<TDataSpec> {
  visibility: TopologyElementVisibility;
  selectedDataSpecifier?: TopologyDataSpecifier<TDataSpec>;
  dataSpecifiers?: TopologyDataSpecifier<TDataSpec>[];
}

export type TopologyNodeState<TDataSpec = unknown> = DeepReadonly<
  TopologyElementState<TDataSpec> & {
    dragging: boolean;
  }
>;
export type TopologyEdgeState<TDataSpec = unknown> = DeepReadonly<TopologyElementState<TDataSpec>>;

export interface TopologyDataSpecifier<T = unknown> {
  label: string;
  value: T;
}

export const enum TopologyElementVisibility {
  Normal = 'normal',
  Emphasized = 'emphasized',
  Focused = 'focused',
  Background = 'background',
  Hidden = 'hidden'
}

export interface TopologyTooltipRenderer {
  build(attachContainer: ElementRef): TopologyTooltip;
}

export interface TopologyTooltip {
  showWithNodeData(node: TopologyNode, origin: ElementRef, options?: TopologyTooltipOptions): void;
  showWithEdgeData(edge: TopologyEdge, origin: ElementRef, options?: TopologyTooltipOptions): void;
  hide(): void;
  destroy(): void;
  hidden$: Observable<void>;
}

export interface TopologyTooltipOptions {
  modal?: boolean;
}
