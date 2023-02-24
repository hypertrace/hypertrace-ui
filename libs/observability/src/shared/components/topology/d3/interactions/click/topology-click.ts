import { Renderer2 } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { D3UtilService } from '../../../../utils/d3/d3-util.service';
import {
  RenderableTopologyEdge,
  RenderableTopologyNode,
  TopologyEdgeRenderer,
  TopologyNodeRenderer
} from '../../../topology';
import { TopologyEventBehavior } from '../topology-event-behavior';

export class TopologyClick extends TopologyEventBehavior {
  public constructor(d3Utils: D3UtilService, domRenderer: Renderer2) {
    super(d3Utils, domRenderer, 'topology-click');
  }

  public addNodeClickBehavior(
    nodes: RenderableTopologyNode[],
    nodeRenderer: TopologyNodeRenderer
  ): Observable<RenderableTopologyNode> {
    return this.buildObservableForEvents(nodes, node => nodeRenderer.getElementForNode(node), {
      eventName: 'click',
      callback: (element, observer) => this.onNodeClick(element, observer)
    });
  }

  public addEdgeClickBehavior(
    edges: RenderableTopologyEdge[],
    edgeRenderer: TopologyEdgeRenderer
  ): Observable<RenderableTopologyEdge> {
    return this.buildObservableForEvents(edges, edge => edgeRenderer.getElementForEdge(edge), {
      eventName: 'click',
      callback: (element, observer) => this.onEdgeClick(element, observer)
    });
  }

  private onNodeClick(node: RenderableTopologyNode, observer: Observer<RenderableTopologyNode>): void {
    observer.next(node);
  }

  private onEdgeClick(edge: RenderableTopologyEdge, observer: Observer<RenderableTopologyEdge>): void {
    observer.next(edge);
  }
}
