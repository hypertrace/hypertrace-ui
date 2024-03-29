import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { PopoverBackdrop, PopoverPositionType, PopoverRelativePositionLocation } from './popover';
import { PopoverContentComponent } from './popover-content.component';
import { PopoverRef } from './popover-ref';
import { PopoverTriggerComponent } from './popover-trigger.component';
import { PopoverService } from './popover.service';

@Component({
  selector: 'ht-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-container *ngTemplateOutlet="this.trigger.content"></ng-container> `,
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
    PopoverRelativePositionLocation.AboveRightAligned,
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

  public constructor(private readonly popoverService: PopoverService, private readonly popoverElement: ElementRef) {}

  public ngOnDestroy(): void {
    if (!this.popover?.closed) {
      this.popover?.close();
    }
  }

  @HostListener('click')
  public onClick(): void {
    if (this.disabled) {
      return;
    }

    this.popover = this.popoverService.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: this.popoverElement,
        locationPreferences: this.locationPreferences,
      },
      componentOrTemplate: this.content.content,
      backdrop: PopoverBackdrop.Transparent,
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
}
