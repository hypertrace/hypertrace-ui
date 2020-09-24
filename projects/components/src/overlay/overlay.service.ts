import { Injectable, Injector, OnDestroy } from '@angular/core';
import { PopoverBackdrop, PopoverFixedPositionLocation, PopoverPositionType } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { SheetOverlayConfig } from './sheet/sheet';

import { Subscription } from 'rxjs';
import { ModalOverlayConfig } from './modal/modal';
import { ModalOverlayComponent } from './modal/modal-overlay.component';
import { ModalRef } from './modal/modal-ref';
import { ModalService } from './modal/modal-service';
import { SheetOverlayComponent } from './sheet/sheet-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class OverlayService implements OnDestroy {
  private activeSheetPopover?: PopoverRef;
  private activeModalPopover?: PopoverRef;

  private sheetCloseSubscription?: Subscription;
  private modalCloseSubscription?: Subscription;

  public constructor(
    private readonly popoverService: PopoverService,
    private readonly modalService: ModalService,
    private readonly defaultInjector: Injector
  ) {}

  public ngOnDestroy(): void {
    this.sheetCloseSubscription?.unsubscribe();
    this.modalCloseSubscription?.unsubscribe();
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

  public createModal<TData = unknown>(
    config: ModalOverlayConfig<TData>,
    injector: Injector = this.defaultInjector
  ): ModalRef {
    this.activeModalPopover?.close();

    const modal = this.modalService.drawPopover({
      componentOrTemplate: ModalOverlayComponent,
      parentInjector: injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Centered
      },
      data: config,
      backdrop: PopoverBackdrop.Opaque
    });

    modal.closeOnNavigation();

    this.setActiveModalPopover(modal);

    return modal;
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

  private setActiveModalPopover(popover: PopoverRef): void {
    this.modalCloseSubscription?.unsubscribe();
    this.activeModalPopover?.close();

    this.activeModalPopover = popover;
    this.activeModalPopover.closeOnNavigation();
    this.modalCloseSubscription = this.activeModalPopover.closed$.subscribe(
      () => (this.activeModalPopover = undefined)
    );
  }
}
