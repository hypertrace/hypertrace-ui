import {
  PopoverBackdrop,
  PopoverFixedPositionLocation,
  PopoverPositionType,
  PopoverRef,
  PopoverService
} from '@hypertrace/components';
import { BOOLEAN_PROPERTY, Model, ModelProperty } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { CartesianSelectedData } from '@hypertrace/observability';
import { Observable, of } from 'rxjs';
import { InteractionHandler } from '../../../../interaction/interaction-handler';
import { CartesianExplorerContextMenuComponent } from './cartesian-explorer-context-menu/cartesian-explorer-context-menu.component';

import { CartesainExplorerNavigationService } from './cartesian-explorer-navigation.service';

@Model({
  type: 'cartesian-explorer-selection-handler'
})
export class CartesianExplorerSelectionHandlerModel<TData> implements InteractionHandler {
  @ModelInject(CartesainExplorerNavigationService)
  private readonly cartesainExplorerNavigationService!: CartesainExplorerNavigationService;

  @ModelInject(PopoverService)
  private readonly popoverService!: PopoverService;

  public popover?: PopoverRef;

  @ModelProperty({
    key: 'show-context-menu',
    displayName: 'Show Context Menu',
    type: BOOLEAN_PROPERTY.type
  })
  public showContextMenu: boolean = true;

  public execute(selectionData: CartesianSelectedData<TData>): Observable<void> {
    if (this.showContextMenu) {
      this.showContextMenuList(selectionData);
      this.popover?.closeOnBackdropClick();
      this.popover?.closeOnPopoverContentClick();
    } else {
      this.cartesainExplorerNavigationService.navigateToExplorer(
        selectionData.timeRange.startTime,
        selectionData.timeRange.endTime
      );
    }

    return of();
  }

  public showContextMenuList(selectionData: CartesianSelectedData<TData>): void {
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
  }
}
