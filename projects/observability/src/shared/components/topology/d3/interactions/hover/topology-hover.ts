import { Renderer2 } from '@angular/core';
import { defaults } from 'lodash';
import { Observable, Observer } from 'rxjs';
import { D3UtilService } from '../../../../utils/d3/d3-util.service';
import {
  RenderableTopologyEdge,
  RenderableTopologyNode,
  TopologyEdgeRenderer,
  TopologyNodeRenderer
} from '../../../topology';
import { TopologyEventBehavior } from '../topology-event-behavior';

export class TopologyHover extends TopologyEventBehavior {
  private static readonly DEFAULT_HOVER_OPTIONS: Required<Readonly<TopologyHoverOptions>> = {
    delayMillis: 0,
    endHoverEvents: ['mouseleave']
  };

  public constructor(d3Utils: D3UtilService, domRenderer: Renderer2) {
    super(d3Utils, domRenderer, 'topology-hover');
  }

  private readonly delayMap: WeakMap<RenderableTopologyElement, TimeoutState> = new WeakMap();

  public addNodeHoverBehavior(
    nodes: RenderableTopologyNode[],
    nodeRenderer: TopologyNodeRenderer,
    options: TopologyHoverOptions = {}
  ): Observable<TopologyHoverEvent<RenderableTopologyNode>> {
    return this.buildObservableForHover(
      nodes,
      node => nodeRenderer.getElementForNode(node),
      this.buildDefaultedOptions(options)
    );
  }

  public addEdgeHoverBehavior(
    edges: RenderableTopologyEdge[],
    edgeRenderer: TopologyEdgeRenderer,
    options: TopologyHoverOptions = {}
  ): Observable<TopologyHoverEvent<RenderableTopologyEdge>> {
    return this.buildObservableForHover(
      edges,
      edge => edgeRenderer.getElementForEdge(edge),
      this.buildDefaultedOptions(options)
    );
  }

  private buildObservableForHover<T extends RenderableTopologyElement>(
    topologyElements: T[],
    elementLookupFn: (topologyElement: T) => Element | undefined,
    options: Required<TopologyHoverOptions>
  ): Observable<TopologyHoverEvent<T>> {
    return this.buildObservableForEvents(
      topologyElements,
      elementLookupFn,
      {
        eventName: 'mouseenter',
        callback: (element, observer) => this.onMouseEnter(element, observer, options.delayMillis)
      },
      ...options.endHoverEvents.map(eventName => ({
        eventName: eventName,
        callback: (element: T, observer: Observer<TopologyHoverEvent<T>>) => this.onHoverEnd(element, observer)
      }))
    );
  }

  private buildDefaultedOptions(provided: TopologyHoverOptions): Required<TopologyHoverOptions> {
    // Lodash doesnt't merge arrays as you'd expect, so we do it by hand
    const newOptions = provided.endHoverEvents
      ? { endHoverEvents: provided.endHoverEvents.concat(TopologyHover.DEFAULT_HOVER_OPTIONS.endHoverEvents) }
      : {};

    return defaults(newOptions, provided, TopologyHover.DEFAULT_HOVER_OPTIONS);
  }

  private onMouseEnter<T extends RenderableTopologyElement>(
    element: T,
    observer: Observer<TopologyHoverEvent<T>>,
    delayMillis: number
  ): void {
    this.clearAnyPendingState(element);
    this.delayMap.set(element, {
      id: setTimeout(() => this.fireStartEventAndUpdateState(element, observer), delayMillis),
      firedStart: false
    });
  }

  private onHoverEnd<T extends RenderableTopologyElement>(element: T, observer: Observer<TopologyHoverEvent<T>>): void {
    const state = this.clearAnyPendingState(element);
    if (state && state.firedStart) {
      this.fireEndEvent(element, observer);
    }
  }

  private fireStartEventAndUpdateState<T extends RenderableTopologyElement>(
    element: T,
    observer: Observer<TopologyHoverEvent<T>>
  ): void {
    const previousState = this.delayMap.get(element);
    if (previousState) {
      this.delayMap.set(element, {
        id: previousState.id,
        firedStart: true
      });
    }
    // Update state first, we want the state to be updated for the subscriber's response
    observer.next({
      source: element,
      event: 'start'
    });
  }

  private fireEndEvent<T extends RenderableTopologyElement>(
    element: T,
    observer: Observer<TopologyHoverEvent<T>>
  ): void {
    observer.next({
      source: element,
      event: 'end'
    });
  }

  private clearAnyPendingState(element: RenderableTopologyElement): undefined | TimeoutState {
    const state = this.delayMap.get(element);
    if (state) {
      clearTimeout(state.id);
      this.delayMap.delete(element);

      return state;
    }

    return undefined;
  }
}

type RenderableTopologyElement = RenderableTopologyNode | RenderableTopologyEdge;
export interface TopologyHoverOptions {
  delayMillis?: number;
  endHoverEvents?: string[];
}

export interface TopologyHoverEvent<T extends RenderableTopologyElement> {
  source: T;
  event: 'start' | 'end';
}

interface TimeoutState {
  id: ReturnType<typeof setTimeout>; // Type defs polluted with node types, this makes types agnostic to return type
  firedStart: boolean;
}
