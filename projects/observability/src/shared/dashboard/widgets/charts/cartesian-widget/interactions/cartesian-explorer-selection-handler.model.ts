import { NavigationService } from '@hypertrace/common';
import { FilterOperator } from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { ExplorerService } from '../../../../../../pages/explorer/explorer-service';
import { ScopeQueryParam } from '../../../../../../pages/explorer/explorer.component';
import { ChartSelect } from '../../../../../../public-api';
import { InteractionHandler } from '../../../../interaction/interaction-handler';

@Model({
  type: 'cartesian-explorer-selection-handler'
})
export class CartesianExplorerSelectionHandlerModel implements InteractionHandler {
  @ModelInject(ExplorerService)
  private readonly explorerService!: ExplorerService;

  @ModelInject(NavigationService)
  private readonly navigationService!: NavigationService;

  public execute(selectionData: ChartSelect): Observable<void> {
    const startPoint = selectionData.start;
    const endPoint = selectionData.end;

    // tslint:disable-next-line
    selectionData.series.map((data: any) => {
      const startDate = data.getXAxisValue(startPoint[0]);
      const endDate = data.getXAxisValue(endPoint[0]);
      this.navigateToExplorer(startDate, endDate);

      return;
    });

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
