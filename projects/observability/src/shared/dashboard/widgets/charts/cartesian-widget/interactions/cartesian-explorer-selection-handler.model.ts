import { NavigationParamsType, NavigationService, TimeRangeService } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { CartesianSelectedData } from '../../../../../../public-api';
import { InteractionHandler } from '../../../../interaction/interaction-handler';

@Model({
  type: 'cartesian-explorer-selection-handler'
})
export class CartesianExplorerSelectionHandlerModel<TData> implements InteractionHandler {
  @ModelInject(TimeRangeService)
  private readonly timeRangeService!: TimeRangeService;

  @ModelInject(NavigationService)
  private readonly navigationService!: NavigationService;

  // tslint:disable-next-line
  public execute(selectionData: CartesianSelectedData<TData>): Observable<void> {
    this.navigateToExplorer(selectionData.timeRange.startTime, selectionData.timeRange.endTime);

    return of();
  }

  private navigateToExplorer(start: Date, end: Date): void {
    const params = this.timeRangeService.toQueryParams(start, end);

    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: ['/explorer'],
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceCurrentHistory: false
    });
  }
}
