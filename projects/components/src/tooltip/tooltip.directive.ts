import { Directive, ElementRef, HostListener, Input, OnDestroy, TemplateRef } from '@angular/core';
import { isNil } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PopoverPositionType, PopoverRelativePositionLocation } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { TooltipContentContainerComponent } from './tooltip-content-container.component';

@Directive({
  selector: '[htcTooltip]'
})
export class TooltipDirective implements OnDestroy {
  private static readonly DEFAULT_HOVER_DELAY_MS: number = 400;

  @Input('htcTooltip')
  public content?: TemplateRef<unknown> | string | number;

  private readonly mouseEnter$: Subject<MouseEvent> = new Subject();
  private readonly mouseLeave$: Subject<MouseEvent> = new Subject();

  private readonly subscriptions: Subscription = new Subscription();

  private popover?: PopoverRef;

  public constructor(private readonly popoverService: PopoverService, private readonly host: ElementRef) {
    this.subscriptions.add(this.mouseLeave$.subscribe(() => this.removeTooltip()));
  }

  @HostListener('mouseenter', ['$event'])
  public onHover(event: MouseEvent): void {
    this.subscriptions.add(
      this.mouseEnter$
        .pipe(debounceTime(TooltipDirective.DEFAULT_HOVER_DELAY_MS), takeUntil(this.mouseLeave$))
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
      data: this.content,
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
