import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { NavigationService } from '../../../../../../../../common/src/navigation/navigation.service';
import { FilterOperator } from '../../../../../../../../components/src/filtering/filter/filter-operators';
import { ExplorerService } from '../../../../../../pages/explorer/explorer-service';
import { ScopeQueryParam } from '../../../../../../pages/explorer/explorer.component';
import { InteractionHandler } from '../../../../interaction/interaction-handler';

@Model({
  type: 'cartesian-explorer-navigation-handler'
})
export class CartesianExplorerNavigationHandlerModel implements InteractionHandler {
  @ModelInject(ExplorerService)
  private readonly explorerService!: ExplorerService;

  @ModelInject(NavigationService)
  private readonly navigationService!: NavigationService;

  public execute(dateRange: any): Observable<void> {
    const startDate = new Date(dateRange.start).getTime() - 6000;
    const endDate = new Date(dateRange.end).getTime() + 6000;

    this.explorerService
      .buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
        {
          field: 'startTime',
          operator: FilterOperator.GreaterThanOrEqualTo,
          value: startDate
        },
        {
          field: 'endTime',
          operator: FilterOperator.LessThanOrEqualTo,
          value: endDate
        }
      ])
      .subscribe(data => {
        this.navigationService.navigate(data);
      });
    return of();
  }
}
