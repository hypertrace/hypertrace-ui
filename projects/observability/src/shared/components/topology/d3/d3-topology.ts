import { ComponentPortal, DomPortalOutlet, PortalInjector } from '@angular/cdk/portal';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  InjectionToken,
  Injector,
  Renderer2,
  Type
} from '@angular/core';
import { assertUnreachable, Key } from '@hypertrace/common';
import { Selection } from 'd3-selection';
import { throttle } from 'lodash';
import { take } from 'rxjs/operators';
import { D3UtilService } from '../../utils/d3/d3-util.service';
import {
  RenderableTopology,
  RenderableTopologyEdge,
  RenderableTopologyNode,
  Topology,
  TopologyConfiguration,
  TopologyEdge,
  TopologyEdgeRenderer,
  TopologyElementVisibility,
  TopologyLayout,
  TopologyNeighborhood,
  TopologyNode,
  TopologyNodeRenderer,
  TopologyTooltip
} from '../topology';
import { TopologyConverter } from '../utils/topology-converter';
import { TopologyNeighborhoodFinder } from '../utils/topology-neighborhood-finder';
import { TopologyClick } from './interactions/click/topology-click';
import { TopologyDragEvent, TopologyNodeDrag } from './interactions/drag/topology-node-drag';
import { TopologyHover, TopologyHoverEvent } from './interactions/hover/topology-hover';
import { TopologyStateManager } from './interactions/state/topology-state-manager';
import {
  TOPOLOGY_INTERACTION_CONTROL_DATA,
  TopologyInteractionControlComponent,
  TopologyInteractionControlData
} from './interactions/topology-interaction-control.component';
import { TopologyZoom } from './interactions/zoom/topology-zoom';
import { TreeLayout } from './layouts/tree-layout';

export class D3Topology implements Topology {
  private static readonly CONTAINER_CLASS: string = 'topology-internal-container';
  private static readonly SVG_CLASS: string = 'topology-svg';
  private static readonly DATA_CLASS: string = 'topology-data';

  protected destroyCallbacks: (() => void)[] = [];
  protected topologyData: RenderableTopology<TopologyNode, TopologyEdge>;
  protected readonly zoom: TopologyZoom<SVGSVGElement, SVGGElement>;
  protected readonly drag: TopologyNodeDrag;
  protected readonly hover: TopologyHover;
  protected readonly click: TopologyClick;
  protected readonly stateManager: TopologyStateManager;
  protected interactionControl?: ComponentRef<TopologyInteractionControlComponent>;
  protected readonly dataClearCallbacks: (() => void)[] = [];
  protected container?: HTMLDivElement;
  protected tooltip?: TopologyTooltip;
  protected layout: TopologyLayout = new TreeLayout(); // TODO: Make this configurable with Node and edge renderers

  protected readonly userNodes: TopologyNode[];
  protected readonly nodeRenderer: TopologyNodeRenderer;
  protected readonly edgeRenderer: TopologyEdgeRenderer;
  protected readonly domRenderer: Renderer2;
  protected readonly d3Util: D3UtilService;
  protected width: number = 0;
  protected height: number = 0;

  private readonly topologyConverter: TopologyConverter = new TopologyConverter();
  private readonly neighborhoodFinder: TopologyNeighborhoodFinder = new TopologyNeighborhoodFinder();

  public constructor(
    protected readonly hostElement: Element,
    protected readonly injector: Injector,
    protected readonly config: TopologyConfiguration
  ) {
    this.userNodes = config.nodes;
    this.nodeRenderer = config.nodeRenderer;
    this.edgeRenderer = config.edgeRenderer;
    this.domRenderer = injector.get(Renderer2 as Type<Renderer2>);
    this.stateManager = new TopologyStateManager(this.config);
    this.topologyData = this.topologyConverter.convertTopology(
      this.userNodes,
      this.stateManager,
      this.nodeRenderer,
      this.domRenderer
    );
    this.d3Util = injector.get(D3UtilService);
    this.drag = new TopologyNodeDrag(this.d3Util, this.domRenderer);
    this.hover = new TopologyHover(this.d3Util, this.domRenderer);
    this.click = new TopologyClick(this.d3Util, this.domRenderer);
    this.zoom = new TopologyZoom();
  }

  public draw(): this {
    this.updateMeasuredDimensions();

    if (!this.container) {
      // Initialization - only happens on first draw
      this.container = this.initializeContainer();
      const stateSubscription = this.stateManager.stateChange$.subscribe(() => this.updateRenderedState());
      this.tooltip = this.config.tooltipRenderer && this.config.tooltipRenderer.build(new ElementRef(this.container));
      this.onDestroy(() => stateSubscription.unsubscribe());
      this.onDestroy(() => this.tooltip && this.tooltip.destroy());
    }

    this.clearAndDrawNewData();

    return this;
  }

  public destroy(): void {
    this.runAndDrainCallbacks(this.destroyCallbacks);
  }

  public onDestroy(destroyFn: () => void): this {
    this.destroyCallbacks.push(destroyFn);

    return this;
  }

  private readonly updatePositions: () => void = throttle((): void => {
    // TODO parameterize, generally only have to update positions on a few things at a time
    // Nodes control positioning, so should be updated first
    this.topologyData.nodes.forEach(node => this.nodeRenderer.updateNodePosition(node));
    this.topologyData.edges.forEach(edge => this.edgeRenderer.updateEdgePosition(edge));
  }, 20);

  private updateRenderedState(): void {
    // TODO parameterize, generally only have to update state on a few things at a time
    this.topologyData.nodes.forEach(node => {
      node.state = this.stateManager.getNodeState(node.userNode);
      this.nodeRenderer.updateNodeState(node);
    });
    this.topologyData.edges.forEach(edge => {
      edge.state = this.stateManager.getEdgeState(edge.userEdge);
      this.edgeRenderer.updateEdgeState(edge);
    });
  }

  private updateLayout(): void {
    this.layout.layout(this.topologyData, this.width, this.height);
    this.updatePositions();
  }

  private initializeContainer(): HTMLDivElement {
    if (this.container) {
      return this.container;
    }

    const host = this.select(this.hostElement);

    const containerSelection = host
      .append('div')
      .classed(D3Topology.CONTAINER_CLASS, true)
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('align-items', 'flex-end');

    const containerElement = containerSelection.node()!;
    this.interactionControl = this.createInteractionControl(containerElement);

    const svg = containerSelection
      .append('svg')
      .classed(D3Topology.SVG_CLASS, true)
      .attr('width', '100%')
      .attr('height', '100%');

    const data = svg.append('g').classed(D3Topology.DATA_CLASS, true);
    const zoomScrollConfig = {
      requireModifiers: [Key.Control, Key.Meta]
    };

    const zoomPanConfig = {
      // Don't require modifiers
    };
    this.zoom.attachZoom({
      container: svg,
      target: data,
      scroll: this.config.zoomable ? zoomScrollConfig : undefined,
      pan: this.config.zoomable ? zoomPanConfig : undefined
    });

    this.onDestroy(() => {
      this.runAndDrainCallbacks(this.dataClearCallbacks);
      containerSelection.remove();
      this.container = undefined;
      this.interactionControl && this.interactionControl.destroy();
      this.interactionControl = undefined;
    });

    return containerElement;
  }

  private drawData(
    data: RenderableTopology<TopologyNode, TopologyEdge>,
    nodeRenderer: TopologyNodeRenderer,
    edgeRenderer: TopologyEdgeRenderer
  ): void {
    const dataGroup = this.select(this.hostElement).select<SVGGElement>(`.${D3Topology.DATA_CLASS}`);

    this.drawNodesAndEdges(dataGroup.node()!, data, nodeRenderer, edgeRenderer);
    this.dataClearCallbacks.push(() => data.edges.forEach(edge => edgeRenderer.destroyEdge(edge)));
    this.dataClearCallbacks.push(() => data.nodes.forEach(node => nodeRenderer.destroyNode(node)));

    if (this.config.draggableNodes) {
      const subscription = this.drag.addDragBehavior(data, nodeRenderer).subscribe(event => this.onNodeDrag(event));
      this.dataClearCallbacks.push(() => subscription.unsubscribe());
    }
    if (this.config.hoverableNodes) {
      const subscription = this.hover
        .addNodeHoverBehavior(data.nodes, nodeRenderer, {
          endHoverEvents: this.getHoverEndEventsFromConfig()
        })
        .subscribe(event => this.onNodeHoverEvent(event));
      this.dataClearCallbacks.push(() => subscription.unsubscribe());
    }
    if (this.config.hoverableEdges) {
      const subscription = this.hover
        .addEdgeHoverBehavior(data.edges, edgeRenderer, {
          endHoverEvents: this.getHoverEndEventsFromConfig()
        })
        .subscribe(event => this.onEdgeHoverEvent(event));
      this.dataClearCallbacks.push(() => subscription.unsubscribe());
    }

    if (this.config.clickableNodes) {
      const subscription = this.click
        .addNodeClickBehavior(data.nodes, nodeRenderer)
        .subscribe(node => this.onNodeClick(node));
      this.dataClearCallbacks.push(() => subscription.unsubscribe());
    }

    if (this.config.clickableEdges) {
      const subscription = this.click
        .addEdgeClickBehavior(data.edges, edgeRenderer)
        .subscribe(edge => this.onEdgeClick(edge));
      this.dataClearCallbacks.push(() => subscription.unsubscribe());
    }
  }

  private createInteractionControl(container: HTMLDivElement): ComponentRef<TopologyInteractionControlComponent> {
    if (this.interactionControl) {
      return this.interactionControl;
    }
    const componentResolver = this.injector.get(
      (ComponentFactoryResolver as unknown) as Type<ComponentFactoryResolver>
    );
    const applicationRef = this.injector.get(ApplicationRef);
    const domPortalOutlet = new DomPortalOutlet(container, componentResolver, applicationRef, this.injector);
    const interactionInjector = new PortalInjector(
      this.injector,
      new WeakMap<InjectionToken<unknown>, TopologyInteractionControlData<SVGSVGElement, SVGGElement>>([
        [
          TOPOLOGY_INTERACTION_CONTROL_DATA,
          {
            stateManager: this.stateManager,
            topologyConfig: this.config,
            layout: () => this.updateLayout(),
            currentTopology: () => this.topologyData,
            zoom: this.config.zoomable ? this.zoom : undefined
          }
        ]
      ])
    );
    const componentPortal = new ComponentPortal(TopologyInteractionControlComponent, undefined, interactionInjector);
    const componentRef = domPortalOutlet.attach(componentPortal);

    return componentRef;
  }

  private drawNodesAndEdges(
    groupElement: SVGGElement,
    topologyData: RenderableTopology<TopologyNode, TopologyEdge>,
    nodeRenderer: TopologyNodeRenderer,
    edgeRenderer: TopologyEdgeRenderer
  ): void {
    topologyData.nodes.forEach(node => nodeRenderer.drawNode(groupElement, node));
    topologyData.edges.forEach(edge => edgeRenderer.drawEdge(groupElement, edge));
    topologyData.nodes.forEach(node => this.select(nodeRenderer.getElementForNode(node)!).raise());
    this.zoom.updateBrushOverlay(topologyData.nodes);
  }

  private updateMeasuredDimensions(): void {
    const boundingRect = this.hostElement.getBoundingClientRect();
    this.width = boundingRect.width;
    this.height = boundingRect.height;
  }

  private runAndDrainCallbacks(callbackArray: (() => void)[]): void {
    callbackArray.forEach(callback => callback());
    callbackArray.length = 0;
  }

  private clearAndDrawNewData(): void {
    this.runAndDrainCallbacks(this.dataClearCallbacks);
    this.topologyData = this.topologyConverter.convertTopology(
      this.userNodes,
      this.stateManager,
      this.nodeRenderer,
      this.domRenderer,
      this.topologyData
    );
    this.layout.layout(this.topologyData, this.width, this.height);
    this.drawData(this.topologyData, this.nodeRenderer, this.edgeRenderer);
  }

  private onNodeHoverEvent(hoverEvent: TopologyHoverEvent<RenderableTopologyNode>): void {
    if (hoverEvent.event === 'end') {
      this.resetVisibility();
      this.tooltip && this.tooltip.hide();
    } else {
      this.emphasizeTopologyNeighborhood(
        this.neighborhoodFinder.neighborhoodForNode(hoverEvent.source.userNode),
        this.neighborhoodFinder.singleNodeNeighborhood(hoverEvent.source.userNode)
      );
      this.tooltip && this.tooltip.showWithNodeData(hoverEvent.source.userNode);
    }
  }

  private onEdgeHoverEvent(hoverEvent: TopologyHoverEvent<RenderableTopologyEdge>): void {
    if (hoverEvent.event === 'end') {
      this.resetVisibility();
      this.tooltip && this.tooltip.hide();
    } else {
      this.emphasizeTopologyNeighborhood(this.neighborhoodFinder.neighborhoodForEdge(hoverEvent.source.userEdge));
      this.tooltip && this.tooltip.showWithEdgeData(hoverEvent.source.userEdge);
    }
  }

  private resetVisibility(): void {
    this.stateManager.updateState({
      neighborhood: this.topologyData.neighborhood,
      update: {
        visibility: TopologyElementVisibility.Normal
      }
    });
  }

  private emphasizeTopologyNeighborhood(
    emphasizeNeighborhood: TopologyNeighborhood,
    focusNeighborhood: TopologyNeighborhood = this.neighborhoodFinder.emptyNeighborhood()
  ): void {
    this.stateManager.updateState(
      {
        neighborhood: this.topologyData.neighborhood,
        update: {
          visibility: TopologyElementVisibility.Background
        }
      },
      {
        neighborhood: emphasizeNeighborhood,
        update: {
          visibility: TopologyElementVisibility.Emphasized
        }
      },
      {
        neighborhood: focusNeighborhood,
        update: {
          visibility: TopologyElementVisibility.Focused
        }
      }
    );
  }

  private getHoverEndEventsFromConfig(): string[] {
    const events = [];
    if (this.config.clickableNodes) {
      events.push('click');
    }
    if (this.config.draggableNodes) {
      events.push(this.drag.getDragEventName());
    }

    return events;
  }

  private onNodeClick(node: RenderableTopologyNode): void {
    this.emphasizeTopologyNeighborhood(
      this.neighborhoodFinder.neighborhoodForNode(node.userNode),
      this.neighborhoodFinder.singleNodeNeighborhood(node.userNode)
    );
    if (this.tooltip) {
      // TODO - a modal tooltip disables the interactions like hover (which is good), but doesn't allow clicking another element without an extra click
      this.tooltip.showWithNodeData(node.userNode, { modal: true });
      this.tooltip.hidden$.pipe(take(1)).subscribe(() => this.resetVisibility());
    }
  }

  private onEdgeClick(edge: RenderableTopologyEdge): void {
    this.emphasizeTopologyNeighborhood(this.neighborhoodFinder.neighborhoodForEdge(edge.userEdge));
    if (this.tooltip) {
      // TODO - a modal tooltip disables the interactions like hover (which is good), but doesn't allow clicking another element without an extra click
      this.tooltip.showWithEdgeData(edge.userEdge, { modal: true });
      this.tooltip.hidden$.pipe(take(1)).subscribe(() => this.resetVisibility());
    }
  }

  private onNodeDrag(dragEvent: TopologyDragEvent): void {
    switch (dragEvent.type) {
      case 'start':
      case 'end':
        this.stateManager.updateState({
          nodes: [dragEvent.node.userNode],
          update: {
            dragging: dragEvent.type === 'start'
          }
        });
        break;
      case 'drag':
        this.updatePositions();
        break;
      default:
        assertUnreachable(dragEvent.type);
    }
  }

  private select<T extends Element>(selector: string | T): Selection<T, unknown, null, undefined> {
    return this.d3Util.select<T>(selector, this.domRenderer);
  }
  // tslint:disable-next-line: max-file-line-count
}
