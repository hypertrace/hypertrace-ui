import { NavigationService } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { Span, spanIdKey } from '../../../../graphql/model/schema/span';
import { InteractionHandler } from '../../interaction-handler';

@Model({
  type: 'span-trace-navigation-handler'
})
export class SpanTraceNavigationHandlerModel implements InteractionHandler {
  @ModelInject(NavigationService)
  private readonly navigationService!: NavigationService;

  public execute(span: Span): Observable<void> {
    if (!isNil(span.traceId)) {
      this.navigationService.navigateWithinApp(['trace', span.traceId as string, { spanId: span[spanIdKey] }]);
    }

    return of();
  }
}
