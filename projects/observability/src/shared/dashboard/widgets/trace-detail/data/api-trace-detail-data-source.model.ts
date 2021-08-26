import { Dictionary } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { Trace, traceIdKey, traceTypeKey } from '../../../../graphql/model/schema/trace';
import { TraceDetailData, TraceDetailDataSourceModel } from './trace-detail-data-source.model';

@Model({
  type: 'api-trace-detail-data-source'
})
export class ApiTraceDetailDataSourceModel extends TraceDetailDataSourceModel {
  protected getTraceAttributes(): string[] {
    const attributes: string[] = [...super.getTraceAttributes(), 'traceId'];
    if (this.trace[traceTypeKey] === ObservabilityTraceType.Api) {
      attributes.push('apiCalleeNameCount');
    }

    return attributes;
  }

  protected constructTraceDetailData(trace: Trace): ApiTraceDetailData {
    return {
      ...super.constructTraceDetailData(trace),
      traceId: trace.traceId as string, // For API Trace traceId is real Trace ID. NOT Symbol('traceId').
      entrySpanId: trace[traceIdKey], // API Trace Symbol('traceId') same as apiTraceId which is actually Entry Span ID,
      exitCallsBreakup: trace.apiCalleeNameCount as Dictionary<string>
    };
  }
}

export interface ApiTraceDetailData extends TraceDetailData {
  entrySpanId: string;
  exitCallsBreakup: Dictionary<string>;
}
