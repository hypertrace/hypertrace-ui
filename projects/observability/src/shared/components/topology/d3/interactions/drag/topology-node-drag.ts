import { drag } from 'd3-drag';
import { event } from 'd3-selection';
import { EMPTY, Observable, Observer, Subject } from 'rxjs';
import {
  RenderableTopology,
  RenderableTopologyNode,
  TopologyEdge,
  TopologyNode,
  TopologyNodeRenderer
} from '../../../topology';
import { TopologyEventBehavior } from '../topology-event-behavior';

export class TopologyNodeDrag extends TopologyEventBehavior {
  /**
   * Watches for drag events on nodes inside the provided drag container, emitting an event
   * on each drag event. Returned observable must be unsubscribed to manually.
   */
  public addDragBehavior(
    topologyData: RenderableTopology<TopologyNode, TopologyEdge>,
    nodeRenderer: TopologyNodeRenderer
  ): Observable<TopologyDragEvent> {
    if (topologyData.nodes.length === 0) {
      return EMPTY;
    }
    const nodeLookup = this.buildLookupMap(topologyData.nodes, node => nodeRenderer.getElementForNode(node));
    const dragSubect = new Subject<TopologyDragEvent>();

    this.d3Utils.selectAll(Array.from(nodeLookup.keys()), this.domRenderer).call(
      drag()
        .subject(this.generateValueFunc(node => node, nodeLookup))
        .on(
          'drag',
          this.generateValueFunc((node, domElement) => this.onNodeDrag(node, dragSubect, domElement), nodeLookup)
        )
        .on(
          'start',
          this.generateValueFunc(node => this.onDragStart(node, dragSubect), nodeLookup)
        )
        .on(
          'end',
          this.generateValueFunc(node => this.onDragEnd(node, dragSubect), nodeLookup)
        )
    );

    return dragSubect.asObservable();
  }

  public getDragEventName(): string {
    // Drag events arent bubbled, so if we want to expose, we need to do it ourselves
    return 'topology-node-drag';
  }

  private onNodeDrag(
    node: RenderableTopologyNode,
    dragObserver: Observer<TopologyDragEvent>,
    domElement: Element
  ): void {
    node.x = event.x;
    node.y = event.y;
    dragObserver.next({
      type: 'drag',
      node: node
    });
    this.d3Utils.select(domElement, this.domRenderer).dispatch(this.getDragEventName());
  }

  private onDragStart(node: RenderableTopologyNode, dragObserver: Observer<TopologyDragEvent>): void {
    dragObserver.next({
      type: 'start',
      node: node
    });
  }

  private onDragEnd(node: RenderableTopologyNode, dragObserver: Observer<TopologyDragEvent>): void {
    dragObserver.next({
      type: 'end',
      node: node
    });
  }
}

export interface TopologyDragEvent {
  node: RenderableTopologyNode;
  type: 'start' | 'drag' | 'end';
}
