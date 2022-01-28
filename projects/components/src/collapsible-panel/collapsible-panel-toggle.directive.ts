import { Directive, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Place the directive on any element anywhere inside
 * the `ht-collapsible-panel` component to automagically
 * listen to click events and toggle the panel.
 *
 * Eg:
 * ```
 *  <ht-collapsible-panel [title]="'Statistics'">
 *    <ht-collapsible-panel-body>
 *       <button htCollapsibleSectionToggle>Close</button>
 *    </ht-collapsible-panel-body>
 * </ht-collapsible-panel>
 * ```
 */
@Directive({
  selector: '[htCollapsiblePanelToggle]'
})
export class CollapsiblePanelToggleDirective {
  @HostListener('click')
  public onClick(): void {
    this.clickSubject.next();
  }

  private readonly clickSubject: Subject<void> = new Subject<void>();
  public readonly clicked$: Observable<void> = this.clickSubject.asObservable();
}
