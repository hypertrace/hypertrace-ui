import { ElementRef, Injectable, OnDestroy, TemplateRef, Type } from '@angular/core';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { PopoverBackdrop, PopoverPositionType, PopoverRelativePositionLocation } from '../popover';
import { PopoverRef } from '../popover-ref';
import { PopoverService } from '../popover.service';

@Injectable()
export class PopoverHoverTriggerService implements OnDestroy {
  private readonly delay: number = 300; // Popover show/close delay time in millisecond
  private readonly subscriptions: Subscription = new Subscription();

  private readonly showPopoverSubject: Subject<PopoverHoverTriggerConfig> = new Subject();
  private readonly showPopover$: Observable<PopoverHoverTriggerConfig> = this.showPopoverSubject
    .asObservable()
    .pipe(debounceTime(this.delay));

  private readonly closePopoverSubject: Subject<true> = new Subject();
  private readonly closePopover$: Observable<true> = this.closePopoverSubject.asObservable();

  private popoverRef?: PopoverRef;
  private popoverContentHovered: boolean = false;

  public constructor(private readonly popoverService: PopoverService) {
    /**
     * 1. Show from the mouse enter
     * 2. This also handles the popover content hover (close on content mouse leave)
     */
    this.subscriptions.add(
      this.showPopover$.pipe(switchMap(config => this.buildAndShowPopover(config))).subscribe(hovered => {
        if (this.popoverContentHovered && !hovered) {
          this.close();
        }

        this.popoverContentHovered = hovered;
      })
    );

    /**
     * 1. Close from the mouse leave
     * 2. If popover content is being hovered, this should not close the popover
     */
    this.subscriptions.add(
      this.closePopover$.pipe(debounceTime(this.delay)).subscribe(() => {
        if (!this.popoverContentHovered) {
          this.close();
        }
      })
    );
  }

  public showPopover(config: PopoverHoverTriggerConfig): void {
    this.showPopoverSubject.next(config);
  }

  public closePopover(): void {
    this.closePopoverSubject.next(true);
  }

  public ngOnDestroy(): void {
    this.close();
    this.subscriptions.unsubscribe();
  }

  private close(): void {
    this.popoverRef?.close();
    this.popoverRef = undefined;
  }

  private buildAndShowPopover(config: PopoverHoverTriggerConfig): Observable<boolean> {
    // If popover content is null/undefined, Then do not create popover
    if (isNil(config.componentOrTemplate)) {
      return EMPTY;
    }

    this.close();
    this.popoverRef = this.drawPopover(config);

    return this.popoverRef.hovered$;
  }

  private drawPopover(config: PopoverHoverTriggerConfig): PopoverRef {
    return this.popoverService.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: config.origin,
        locationPreferences: config.options?.locationPreferences ?? [
          PopoverRelativePositionLocation.BelowCentered,
          PopoverRelativePositionLocation.BelowRightAligned,
          PopoverRelativePositionLocation.BelowLeftAligned,
          PopoverRelativePositionLocation.AboveCentered,
          PopoverRelativePositionLocation.AboveRightAligned,
          PopoverRelativePositionLocation.AboveLeftAligned,
          PopoverRelativePositionLocation.LeftCentered,
          PopoverRelativePositionLocation.OverLeftAligned,
          PopoverRelativePositionLocation.RightCentered
        ]
      },
      data: config.options?.data,
      backdrop: PopoverBackdrop.None,
      componentOrTemplate: config.componentOrTemplate
    });
  }
}

export interface PopoverHoverTriggerConfig<TContent = TemplateRef<unknown> | Type<unknown>, TData = unknown> {
  origin: ElementRef;
  componentOrTemplate: TContent;
  options?: {
    data?: TData;
    locationPreferences?: PopoverRelativePositionLocation[];
  };
}
