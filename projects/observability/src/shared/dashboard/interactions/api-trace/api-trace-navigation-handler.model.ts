import { NavigationService } from '@hypertrace/common';
import { InteractionHandler, Trace, traceIdKey, traceTypeKey } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';

@Model({
  type: 'api-trace-navigation-handler'
})
export class ApiTraceNavigationHandlerModel implements InteractionHandler {
  @ModelInject(NavigationService)
  private readonly navigationService!: NavigationService;

  public execute(trace: Trace): Observable<void> {
    if (trace[traceTypeKey] === ObservabilityTraceType.Api) {
      this.navigationService.navigateWithinApp(['api-trace', trace[traceIdKey]]);
    }

    return of();
  }
}
