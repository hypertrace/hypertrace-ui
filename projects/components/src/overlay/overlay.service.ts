import { Injectable, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopoverFixedPositionLocation, PopoverPositionType } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { DefaultSheetRef } from './sheet/default-sheet-ref';
import { SheetOverlayConfig, SheetRef, SHEET_DATA } from './sheet/sheet';
import { SheetOverlayComponent } from './sheet/sheet-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private activeSheetPopover?: PopoverRef;

  private sheetCloseSubscription?: Subscription;

  public constructor(private readonly popoverService: PopoverService, private readonly defaultInjector: Injector) {}

  public createSheet<TData = unknown, TResponse = unknown>(
    config: SheetOverlayConfig<TData>,
    injector: Injector = this.defaultInjector
  ): SheetRef<TResponse> {
    this.activeSheetPopover?.close();

    const sheetRef = new DefaultSheetRef();
    const metadata = this.buildMetadata(config, injector, sheetRef);
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: SheetOverlayComponent,
      parentInjector: injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: config.position ?? PopoverFixedPositionLocation.RightUnderHeader
      },
      data: metadata
    });

    popover.closeOnNavigation();
    sheetRef.initialize(popover);

    this.setActiveSheetPopover(popover);

    return sheetRef as SheetRef<TResponse>;
  }

  private buildMetadata(
    config: SheetOverlayConfig,
    parentInjector: Injector,
    sheetRef: SheetRef
  ): SheetConstructionData {
    return {
      config: config,
      injector: Injector.create({
        providers: [
          {
            provide: SHEET_DATA,
            useValue: config.data
          },
          {
            provide: SheetRef,
            useValue: sheetRef
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
