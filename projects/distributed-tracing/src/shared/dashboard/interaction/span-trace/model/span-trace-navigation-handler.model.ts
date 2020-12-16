import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { Span, spanIdKey } from '../../../../graphql/model/schema/span';
import { InteractionHandler } from '../../interaction-handler';
import { TracingNavigationService } from './../../../../services/navigation/tracing-navigation.service';

@Model({
  type: 'span-trace-navigation-handler'
})
export class SpanTraceNavigationHandlerModel implements InteractionHandler {
  @ModelInject(TracingNavigationService)
  private readonly tracingNavigationService!: TracingNavigationService;

  public execute(span: Span): Observable<void> {
    if (!isNil(span.traceId)) {
      this.tracingNavigationService.navigateToTraceDetail(span.traceId as string, span[spanIdKey], span.startTime);
    }

    return of();
  }
}
