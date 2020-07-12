import { Renderer2 } from '@angular/core';
import { ValueFn } from 'd3-selection';
import { EMPTY, Observable, Observer, Subject } from 'rxjs';
import { D3UtilService } from '../../../utils/d3/d3-util.service';
import { RenderableTopologyEdge, RenderableTopologyNode } from '../../topology';

export abstract class TopologyEventBehavior {
  public constructor(
    protected readonly d3Utils: D3UtilService,
    protected readonly domRenderer: Renderer2,
    protected readonly eventScope?: string
  ) {}
  protected buildLookupMap<T extends RenderableTopologyElement>(
    renderableElements: T[],
    elementLookupFn: (renderableElements: T) => Element | undefined
  ): Map<Element, T> {
    return new Map<Element, T>(
      renderableElements
        .map(renderableElement => [elementLookupFn(renderableElement), renderableElement] as const)
        .filter((elementPair): elementPair is [Element, T] => elementPair[0] !== undefined)
    );
  }

  protected generateValueFunc<T extends RenderableTopologyElement, TResult>(
    action: (renderableElement: T, domElement: Element) => TResult,
    elementLookupMap: WeakMap<Element, T>
  ): ValueFn<Element, unknown, TResult | undefined> {
    return function (this: Element): TResult | undefined {
      const renderableEl = elementLookupMap.get(this);

      return renderableEl && action(renderableEl, this);
    };
  }

  protected buildObservableForEvents<TTopologyElement extends RenderableTopologyElement, TEvent>(
    topologyElements: TTopologyElement[],
    elementLookupFn: (topologyElement: TTopologyElement) => Element | undefined,
    ...eventAndCallbacks: {
      eventName: string;
      callback(element: TTopologyElement, eventObserver: Observer<TEvent>): void;
    }[]
  ): Observable<TEvent> {
    if (topologyElements.length === 0) {
      return EMPTY;
    }

    const eventSubject = new Subject<TEvent>();
    const lookupMap = this.buildLookupMap(topologyElements, elementLookupFn);

    const selection = this.d3Utils.selectAll(Array.from(lookupMap.keys()), this.domRenderer);

    eventAndCallbacks.forEach(({ eventName, callback }) => {
      selection.on(
        this.scopeEventName(eventName),
        this.generateValueFunc(topologyElement => callback(topologyElement, eventSubject), lookupMap)
      );
    });

    return eventSubject.asObservable();
  }

  protected scopeEventName(eventName: string): string {
    if (this.eventScope !== undefined) {
      return `${eventName}.${this.eventScope}`;
    }

    return eventName;
  }
}

type RenderableTopologyElement = RenderableTopologyNode | RenderableTopologyEdge;
