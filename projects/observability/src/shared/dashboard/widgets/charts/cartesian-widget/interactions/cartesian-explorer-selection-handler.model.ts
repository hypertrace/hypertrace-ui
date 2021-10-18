import { NavigationService } from '@hypertrace/common';
import { FilterOperator } from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { ExplorerService } from '../../../../../../pages/explorer/explorer-service';
import { ScopeQueryParam } from '../../../../../../pages/explorer/explorer.component';
import { InteractionHandler } from '../../../../interaction/interaction-handler';

@Model({
  type: 'cartesian-explorer-selection-handler'
})
export class CartesianExplorerSelectionHandlerModel implements InteractionHandler {
  @ModelInject(ExplorerService)
  private readonly explorerService!: ExplorerService;

  @ModelInject(NavigationService)
  private readonly navigationService!: NavigationService;

  // tslint:disable-next-line
  public execute(selectionData: any): Observable<void> {
    const startPoint = selectionData[0];
    const endPoint = selectionData[0];

    const startDate = new Date(startPoint.dataPoint.timestamp);
    const endDate = new Date(endPoint.dataPoint.timestamp);

    this.navigateToExplorer(startDate, endDate);

    return of();
  }

  private navigateToExplorer(start: Date, end: Date): void {
    const startTime: number = new Date(start).getTime();
    const endTime: number = new Date(end).getTime();
    this.explorerService
      .buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
        {
          field: 'startTime',
          operator: FilterOperator.GreaterThanOrEqualTo,
          value: startTime
        },
        {
          field: 'endTime',
          operator: FilterOperator.LessThanOrEqualTo,
          value: endTime
        }
      ])
      .subscribe(data => {
        this.navigationService.navigate(data);
      });
  }
}
