import { PopoverRef } from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { CartesianSelectedData } from '../../../../../../public-api';
import { InteractionHandler } from '../../../../interaction/interaction-handler';

import { CartesainExplorerNavigationService } from './cartesian-explorer-navigation.service';

@Model({
  type: 'cartesian-explorer-selection-handler'
})
export class CartesianExplorerSelectionHandlerModel<TData> implements InteractionHandler {
  @ModelInject(CartesainExplorerNavigationService)
  private readonly cartesainExplorerNavigationService!: CartesainExplorerNavigationService;

  public popover?: PopoverRef;

  public execute(selectionData: CartesianSelectedData<TData>): Observable<void> {
    this.cartesainExplorerNavigationService.navigateToExplorer(
      selectionData.timeRange.startTime,
      selectionData.timeRange.endTime
    );

    return of();
  }
}
