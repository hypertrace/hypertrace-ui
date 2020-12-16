import {
  InteractionHandler,
  Trace,
  traceIdKey,
  traceTypeKey,
  TracingNavigationService
} from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';

@Model({
  type: 'api-trace-navigation-handler'
})
export class ApiTraceNavigationHandlerModel implements InteractionHandler {
  @ModelInject(TracingNavigationService)
  private readonly tracingNavigationService!: TracingNavigationService;

  public execute(trace: Trace): Observable<void> {
    if (trace[traceTypeKey] === ObservabilityTraceType.Api) {
      this.tracingNavigationService.navigateToApiTraceDetail(trace[traceIdKey], trace.startTime);
    }

    return of();
  }
}
