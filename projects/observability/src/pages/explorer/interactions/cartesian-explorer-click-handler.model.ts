import {
  FilterAttribute,
  FilterAttributeType,
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
import { FilterButtonContentData, FilterButtonWrapperComponent } from './filter-button-wrapper/filter-button-wrapper.component';

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
    this.popover = this.popoverService.drawPopover<FilterButtonContentData>({
      componentOrTemplate: FilterButtonWrapperComponent,
      data: {
        attribute: {
          name: 'callsCount',
          displayName: 'Calls Count',
          type: FilterAttributeType.String
        },
        value: 1800
      },
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Custom,
        customLocation: location
      },
      backdrop: PopoverBackdrop.Transparent
    });
  }
}
