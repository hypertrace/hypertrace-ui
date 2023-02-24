import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { IconRegistryService } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { ArrayLike, namespaces, select, selectAll, Selection } from 'd3-selection';
import { defer, Observable, of } from 'rxjs';
import { TraceD3Selection } from './trace-d3-selection';

@Injectable({ providedIn: 'root' })
export class D3UtilService {
  public constructor(private readonly iconRegistryService: IconRegistryService) {}

  public getNamespaceUri(namespaceShorthand: SupportedNamespace): string {
    return namespaces[namespaceShorthand];
  }

  public select<TElement extends Element, TData = unknown>(
    selector: string | TElement | ElementRef,
    renderer: Renderer2
  ): Selection<TElement, TData, null, undefined> {
    const selectable: TElement = selector instanceof ElementRef ? selector.nativeElement : selector;

    return new TraceD3Selection(renderer, this, select<TElement, TData>(selectable));
  }

  public selectAll<TElement extends Element, TData = unknown>(
    selector: string | ArrayLike<TElement> | Element[],
    renderer: Renderer2
  ): Selection<TElement, TData, null, undefined> {
    return new TraceD3Selection(renderer, this, selectAll<TElement, TData>(selector as ArrayLike<TElement>));
  }

  public createDetached<TElement>(renderer: Renderer2, tag: string, namespace?: string): TElement {
    return renderer.createElement(tag, namespace);
  }

  public buildIcon(iconType: string, domRenderer: Renderer2): Observable<SVGElement> {
    const iconInfo = this.iconRegistryService.getIconRenderInfo(iconType);
    switch (iconInfo.iconRenderType) {
      case 'svg':
        return iconInfo.getSvgElement();
      case 'ligature':
        return defer(() =>
          of(
            this.select(domRenderer.createElement('text', this.getNamespaceUri('svg')), domRenderer)
              .text(iconInfo.ligatureText)
              .attr('dominant-baseline', 'text-before-edge')
              .classed(iconInfo.fontSet, true)
              .style('font-size', 'inherit')
              .node()
          )
        );
      default:
        return assertUnreachable(iconInfo);
    }
  }
}

type SupportedNamespace = 'svg' | 'xhtml';
