import { Injectable } from '@angular/core';
import { SpanType } from '../../graphql/model/schema/span';
import { TracingIconType } from '../../icons/tracing-icon-type';

@Injectable({ providedIn: 'root' })
export class TracingIconLookupService {
  public forSpanType(spanType: SpanType): TracingIconType | undefined {
    switch (spanType) {
      case SpanType.Entry:
        return TracingIconType.EntrySpan;
      case SpanType.Exit:
        return TracingIconType.ExitSpan;
      default:
        return undefined;
    }
  }
}
