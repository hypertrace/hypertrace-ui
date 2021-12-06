import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { Trace, traceIdKey, traceTypeKey } from '../../../graphql/model/schema/trace';
import { TracingNavigationService } from '../../../services/navigation/tracing-navigation.service';
import { InteractionHandler } from '../../interaction/interaction-handler';

@Model({
  type: 'api-trace-navigation-handler'
})
export class ApiTraceNavigationHandlerModel implements InteractionHandler {
  @ModelInject(TracingNavigationService)
  private readonly tracingNavigationService!: TracingNavigationService;

  public execute(trace: Trace): Observable<void> {
    if (trace[traceTypeKey] === ObservabilityTraceType.Api) {
      this.tracingNavigationService.navigateToApiTraceDetail(
        trace[traceIdKey],
        trace.startTime as string | number | undefined
      );
    }

    return of();
  }
}
