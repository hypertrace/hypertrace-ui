import { Directive, ElementRef, HostListener, Input, OnDestroy, TemplateRef } from '@angular/core';
import { isNil } from 'lodash-es';
import { fromEvent, merge, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PopoverPositionType, PopoverRelativePositionLocation } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { TooltipContentContainerComponent } from './tooltip-content-container.component';

@Directive({
  selector: '[htTooltip]'
})
export class TooltipDirective implements OnDestroy {
  private static readonly DEFAULT_HOVER_DELAY_MS: number = 400;

  @Input('htTooltip')
  public content?: TemplateRef<unknown> | string | number;

  @Input('htTooltipContext')
  public context?: unknown;

  private readonly mouseEnter$: Subject<MouseEvent> = new Subject();
  private readonly mouseLeave$: Subject<MouseEvent> = new Subject();
  /**
   * When tooltip is inside another overlay, and when user clicks on the items which has the
   * tooltip, the mouseleave event will not be fired and hence the tooltip stays on the screen even
   * after the overlay is closed.
   */
  private readonly click$: Observable<MouseEvent> = fromEvent<MouseEvent>(this.host.nativeElement, 'click');
  private readonly hideTooltip$: Observable<MouseEvent> = merge(this.mouseLeave$, this.click$);
  private readonly subscriptions: Subscription = new Subscription();

  private popover?: PopoverRef;

  public constructor(private readonly popoverService: PopoverService, private readonly host: ElementRef) {
    this.subscriptions.add(this.hideTooltip$.subscribe(() => this.removeTooltip()));
  }

  @HostListener('mouseenter', ['$event'])
  public onHover(event: MouseEvent): void {
    this.subscriptions.add(
      this.mouseEnter$
        .pipe(debounceTime(TooltipDirective.DEFAULT_HOVER_DELAY_MS), takeUntil(this.hideTooltip$))
        .subscribe(() => this.showTooltip())
    );

    this.mouseEnter$.next(event);
  }

  @HostListener('mouseleave', ['$event'])
  public onHoverEnd(event: MouseEvent): void {
    this.mouseLeave$.next(event);
  }

  public ngOnDestroy(): void {
    this.removeTooltip();
    this.subscriptions.unsubscribe();
  }

  private showTooltip(): void {
    if (isNil(this.content) || this.content === '' || this.popover) {
      return;
    }

    this.popover = this.popoverService.drawPopover({
      componentOrTemplate: TooltipContentContainerComponent,
      data: { content: this.content, context: this.context ?? {} },
      position: {
        type: PopoverPositionType.Relative,
        origin: this.host,
        locationPreferences: [
          PopoverRelativePositionLocation.BelowCentered,
          PopoverRelativePositionLocation.AboveCentered,
          PopoverRelativePositionLocation.RightCentered,
          PopoverRelativePositionLocation.LeftCentered
        ]
      }
    });
  }

  private removeTooltip(): void {
    if (this.popover) {
      this.popover.close();
      this.popover = undefined;
    }
  }
}
