import {
  PopoverBackdrop,
  PopoverFixedPositionLocation,
  PopoverPositionType,
  PopoverRef,
  PopoverService
} from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { CartesianSelectedData } from '../../../../../../public-api';
import { InteractionHandler } from '../../../../interaction/interaction-handler';

import { CartesianExplorerContextMenuComponent } from './cartesian-explorer-context-menu/cartesian-explorer-context-menu.component';
import { CartesainExplorerNavigationService } from './cartesian-explorer-navigation.service';

@Model({
  type: 'cartesian-explorer-selection-handler'
})
export class CartesianExplorerSelectionHandlerModel<TData> implements InteractionHandler {
  @ModelInject(PopoverService)
  private readonly popoverService!: PopoverService;

  @ModelInject(CartesainExplorerNavigationService)
  private readonly cartesainExplorerNavigationService!: CartesainExplorerNavigationService;

  private popover?: PopoverRef;

  public execute(selectionData: CartesianSelectedData<TData>): Observable<void> {
    if (selectionData.showContextMenu) {
      this.showContextMenu(selectionData);
    } else {
      this.cartesainExplorerNavigationService.navigateToExplorer(
        selectionData.timeRange.startTime,
        selectionData.timeRange.endTime
      );
    }

    return of();
  }

  private showContextMenu(selectionData: CartesianSelectedData<TData>): void {
    this.popover = this.popoverService.drawPopover({
      componentOrTemplate: CartesianExplorerContextMenuComponent,
      data: selectionData,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Custom,
        customLocation: selectionData.location
      },
      backdrop: PopoverBackdrop.Transparent
    });
    this.popover.closeOnBackdropClick();
    this.popover.closeOnPopoverContentClick();
  }
}
