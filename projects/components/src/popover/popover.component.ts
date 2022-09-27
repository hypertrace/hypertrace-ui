import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { PopoverBackdrop, PopoverPositionType, PopoverRelativePositionLocation } from './popover';
import { PopoverContentComponent } from './popover-content.component';
import { PopoverRef } from './popover-ref';
import { PopoverTriggerComponent, PopoverTriggerType } from './popover-trigger.component';
import { PopoverService } from './popover.service';
import { PopoverHoverTriggerService } from './service/popover-hover-trigger.service';

@Component({
  selector: 'ht-popover',
  providers: [PopoverHoverTriggerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-container *ngTemplateOutlet="this.trigger.content"></ng-container> `
})
export class PopoverComponent implements OnDestroy {
  @Input()
  public closeOnClick: boolean = false;

  @Input()
  public closeOnNavigate: boolean = true;

  @Input()
  public disabled: boolean = false;

  @Input()
  public locationPreferences: PopoverRelativePositionLocation[] = [
    PopoverRelativePositionLocation.BelowLeftAligned,
    PopoverRelativePositionLocation.BelowRightAligned,
    PopoverRelativePositionLocation.AboveLeftAligned,
    PopoverRelativePositionLocation.AboveRightAligned
  ];

  @Output()
  public readonly popoverOpen: EventEmitter<PopoverRef> = new EventEmitter();

  @Output()
  public readonly popoverClose: EventEmitter<void> = new EventEmitter();

  @ContentChild(PopoverTriggerComponent, { static: true })
  public trigger!: PopoverTriggerComponent;

  @ContentChild(PopoverContentComponent, { static: true })
  public content!: PopoverContentComponent;

  private popover?: PopoverRef;

  public constructor(
    private readonly popoverService: PopoverService,
    private readonly popoverHoverTriggerService: PopoverHoverTriggerService,
    private readonly popoverElement: ElementRef
  ) {}

  public ngOnDestroy(): void {
    if (!this.popover?.closed) {
      this.popover?.close();
    }
  }

  @HostListener('click')
  public onClick(): void {
    if (this.popoverTriggerType === PopoverTriggerType.Click) {
      this.handleClickPopoverTrigger();
    }
  }

  @HostListener('mouseenter')
  public onMouseenter(): void {
    if (this.popoverTriggerType === PopoverTriggerType.Hover) {
      this.handleHoverPopoverTrigger('mouseenter');
    }
  }

  @HostListener('mouseleave')
  public onMouseLeave(): void {
    if (this.popoverTriggerType === PopoverTriggerType.Hover) {
      this.handleHoverPopoverTrigger('mouseleave');
    }
  }

  private get popoverTriggerType(): PopoverTriggerType {
    return this.trigger?.type ?? PopoverTriggerType.Click;
  }

  private handleClickPopoverTrigger(): void {
    if (this.disabled) {
      return;
    }

    this.popover = this.popoverService.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: this.popoverElement,
        locationPreferences: this.locationPreferences
      },
      componentOrTemplate: this.content.content,
      backdrop: PopoverBackdrop.Transparent
    });

    // Closing can happen internal to the Popover for things like closeOnBackdropClick. Let the consumer know.
    this.popover.closed$.subscribe(() => this.popoverClose.emit());

    this.popover.closeOnBackdropClick();

    if (this.closeOnClick) {
      this.popover.closeOnPopoverContentClick();
    }
    if (this.closeOnNavigate) {
      this.popover.closeOnNavigation();
    }

    this.popoverOpen.emit(this.popover);
  }

  private handleHoverPopoverTrigger(event: 'mouseenter' | 'mouseleave'): void {
    if (this.disabled) {
      return;
    }

    switch (event) {
      case 'mouseenter':
        this.popoverHoverTriggerService.showPopover({
          origin: this.popoverElement,
          popoverContent: this.content,
          options: {
            data: this.content.data
          }
        });
        break;

      case 'mouseleave':
        this.popoverHoverTriggerService.closePopover();
        break;

      default:
        assertUnreachable(event);
    }
  }
}
