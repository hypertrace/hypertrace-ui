import { FilterButtonContentComponent } from './../../../../../components/src/filtering/filter-button/filter-button-content.component';
import {
  FilterAttribute,
  PopoverBackdrop,
  PopoverFixedPositionLocation,
  PopoverPositionType,
  PopoverRef,
  PopoverService
} from '@hypertrace/components';
import { Model, ARRAY_PROPERTY, ModelProperty } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { CartesianSelectedData, InteractionHandler } from '@hypertrace/observability';
import { Observable, of } from 'rxjs';

@Model({
  type: 'cartesian-explorer-click-handler'
})
export class CartesianExplorerClickHandlerModel<TData> implements InteractionHandler {
  @ModelInject(PopoverService)
  private readonly popoverService!: PopoverService;

  @ModelProperty({
    key: 'attributes',
    displayName: 'attributes',
    type: ARRAY_PROPERTY.type
  })
  public attributes: FilterAttribute[] = [];

  public popover?: PopoverRef;

  public execute(selectionData: CartesianSelectedData<TData>[]): Observable<void> {
    this.showContextMenuList(selectionData);
    this.popover?.closeOnBackdropClick();
    this.popover?.closeOnPopoverContentClick();

    return of();
  }

  public showContextMenuList(selectionData: CartesianSelectedData<TData> | CartesianSelectedData<TData>[]): void {
    const data = [selectionData].flat()[0];

    const location = data.location;
    this.popover = this.popoverService.drawPopover({
      componentOrTemplate: FilterButtonContentComponent,
      data: selectionData,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Custom,
        customLocation: location
      },
      backdrop: PopoverBackdrop.Transparent
    });
  }
}