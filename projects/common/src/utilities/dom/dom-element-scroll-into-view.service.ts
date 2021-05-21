import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DomElementScrollIntoViewService {
  public scrollIntoView(element?: HTMLElement): void {
    // Basically just here so we can polyfill this in tests
    return element?.scrollIntoView();
  }
}
