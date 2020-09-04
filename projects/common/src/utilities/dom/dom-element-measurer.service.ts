import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DomElementMeasurerService {
  public measureSvgElement(element: SVGGraphicsElement): DOMRect {
    // Basically just here so we can polyfill this in tests
    return element.getBBox();
  }

  public getComputedTextLength(element: SVGTextElement): number {
    return element.getComputedTextLength();
  }

  public measureHtmlElement(element: HTMLElement): ClientRect {
    // Offset values are probably better, but return integer rather than fractional values.
    // This will be incorrect if we start using transforms on measured elements.
    return element.getBoundingClientRect();
  }
}
