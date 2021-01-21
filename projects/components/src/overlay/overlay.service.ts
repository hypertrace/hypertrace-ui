import { Injectable, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopoverFixedPositionLocation, PopoverPositionType } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { SheetOverlayConfig, SHEET_DATA } from './sheet/sheet';
import { SheetOverlayComponent } from './sheet/sheet-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private activeSheetPopover?: PopoverRef;

  private sheetCloseSubscription?: Subscription;

  public constructor(private readonly popoverService: PopoverService, private readonly defaultInjector: Injector) {}

  public createSheet(config: SheetOverlayConfig, injector: Injector = this.defaultInjector): PopoverRef {
    this.activeSheetPopover?.close();

    const metadata = this.buildMetadata(config, injector);
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: SheetOverlayComponent,
      parentInjector: injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.RightUnderHeader
      },
      data: metadata
    });

    popover.closeOnNavigation();

    this.setActiveSheetPopover(popover);

    return popover;
  }

  private buildMetadata(config: SheetOverlayConfig, parentInjector: Injector): SheetConstructionData {
    return {
      config: config,
      injector: Injector.create({
        providers: [
          {
            provide: SHEET_DATA,
            useValue: config.data
          }
        ],
        parent: parentInjector
      })
    };
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

export interface SheetConstructionData {
  config: SheetOverlayConfig;
  injector: Injector;
}
