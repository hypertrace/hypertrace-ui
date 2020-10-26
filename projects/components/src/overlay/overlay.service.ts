import { Injectable, Injector, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalConfig, ModalRef } from '../modal/modal';
import { ModalService } from '../modal/modal.service';
import { PopoverFixedPositionLocation, PopoverPositionType } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { SheetOverlayConfig } from './sheet/sheet';
import { SheetOverlayComponent } from './sheet/sheet-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class OverlayService implements OnDestroy {
  private activeSheetPopover?: PopoverRef;

  private sheetCloseSubscription?: Subscription;

  public constructor(
    private readonly popoverService: PopoverService,
    private readonly modalService: ModalService,
    private readonly defaultInjector: Injector
  ) {}

  public ngOnDestroy(): void {
    this.sheetCloseSubscription?.unsubscribe();
  }

  public createSheet(config: SheetOverlayConfig, injector: Injector = this.defaultInjector): PopoverRef {
    this.activeSheetPopover?.close();

    const popover = this.popoverService.drawPopover({
      componentOrTemplate: SheetOverlayComponent,
      parentInjector: injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.RightUnderHeader
      },
      data: config
    });

    popover.closeOnNavigation();

    this.setActiveSheetPopover(popover);

    return popover;
  }

  // @deprecated provided for backwards compatibility
  public createModal(config: ModalConfig, injector: Injector = this.defaultInjector): ModalRef<never> {
    return this.modalService.createModal(config, injector);
  }

  private setActiveSheetPopover(popover: PopoverRef): void {
    this.sheetCloseSubscription?.unsubscribe();
    this.activeSheetPopover?.close();

    this.activeSheetPopover = popover;
    this.activeSheetPopover.closeOnNavigation();
    this.sheetCloseSubscription = this.activeSheetPopover.closed$.subscribe(
      () => (this.activeSheetPopover = undefined)
    );
  }
}
