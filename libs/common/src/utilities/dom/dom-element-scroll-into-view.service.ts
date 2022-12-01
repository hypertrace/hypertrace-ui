import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DomElementScrollIntoViewService {
  /**
   * Scroll the element into view if it is not already visible
   * @param element The element to scroll into view
   * @param arg - `alignToTop` or `scrollIntoViewOptions`
   */
  public scrollIntoView(element?: HTMLElement, arg?: ScrollIntoViewOptions | boolean): void {
    // Basically just here so we can polyfill this in tests
    return element?.scrollIntoView(arg);
  }
}
