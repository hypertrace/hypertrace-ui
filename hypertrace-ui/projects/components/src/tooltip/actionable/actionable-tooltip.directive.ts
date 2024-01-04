import { Directive, ElementRef, HostListener, Input, OnDestroy, TemplateRef } from '@angular/core';
import { isNil } from 'lodash-es';
import { PopoverRelativePositionLocation } from '../../popover/popover';
import { PopoverHoverTriggerService } from '../../popover/service/popover-hover-trigger.service';
import { TooltipContentContainerComponent } from '../tooltip-content-container.component';

@Directive({
  selector: '[htActionableTooltip]',
  providers: [PopoverHoverTriggerService],
})
export class ActionableTooltipDirective implements OnDestroy {
  @Input('htActionableTooltip')
  public content?: TemplateRef<unknown> | string | number;

  @Input('htActionableTooltipContext')
  public context?: unknown;

  public constructor(private readonly popoverService: PopoverHoverTriggerService, private readonly host: ElementRef) {}

  @HostListener('mouseenter')
  public onHover(): void {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  @HostListener('click')
  public onHoverEnd(): void {
    this.removeTooltip();
  }

  public ngOnDestroy(): void {
    this.removeTooltip();
  }

  private showTooltip(): void {
    if (isNil(this.content) || this.content === '') {
      return;
    }

    this.popoverService.showPopover({
      origin: this.host,
      componentOrTemplate: TooltipContentContainerComponent,
      options: {
        data: { content: this.content, context: this.context ?? {} },
        locationPreferences: [
          PopoverRelativePositionLocation.BelowCentered,
          PopoverRelativePositionLocation.AboveCentered,
          PopoverRelativePositionLocation.RightCentered,
          PopoverRelativePositionLocation.LeftCentered,
        ],
      },
    });
  }

  private removeTooltip(): void {
    this.popoverService.closePopover();
  }
}
