import { NavigationParamsType, NavigationService, TimeRangeService } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { InteractionHandler } from '../../../../interaction/interaction-handler';

@Model({
  type: 'cartesian-explorer-selection-handler'
})
export class CartesianExplorerSelectionHandlerModel implements InteractionHandler {
  @ModelInject(TimeRangeService)
  private readonly timeRangeService!: TimeRangeService;

  @ModelInject(NavigationService)
  private readonly navigationService!: NavigationService;

  // tslint:disable-next-line
  public execute(selectionData: any): Observable<void> {
    const startPoint = selectionData[0];
    const endPoint = selectionData[1];

    // When there is only one point in selected area, start timestamp  and end timestamp is same. This causes timerange exception
    const startTime = new Date(startPoint.dataPoint.timestamp).getTime() - 6000;
    const endTime = new Date(endPoint.dataPoint.timestamp).getTime() + 6000;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    this.navigateToExplorer(startDate, endDate);

    return of();
  }

  private navigateToExplorer(start: Date, end: Date): void {
    const params = this.timeRangeService.toQueryParams(start, end);

    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: ['/explorer'],
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceCurrentHistory: true
    });
  }
}
