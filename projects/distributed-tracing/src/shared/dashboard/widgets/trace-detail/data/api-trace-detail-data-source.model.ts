import { Model } from '@hypertrace/hyperdash';
import { Trace, traceIdKey } from '../../../../graphql/model/schema/trace';

import { Dictionary } from '@hypertrace/common';
import { TraceDetailData, TraceDetailDataSourceModel } from './trace-detail-data-source.model';

@Model({
  type: 'api-trace-detail-data-source'
})
export class ApiTraceDetailDataSourceModel extends TraceDetailDataSourceModel {
  protected getTraceAttributes(): string[] {
    // TODO : request for 'apiCalleeNameCount' here
    return [...super.getTraceAttributes(), 'traceId'];
  }

  protected constructTraceDetailData(trace: Trace): ApiTraceDetailData {
    return {
      ...super.constructTraceDetailData(trace),
      traceId: trace.traceId as string, // For API Trace traceId is real Trace ID. NOT Symbol('traceId').
      entrySpanId: trace[traceIdKey], // API Trace Symbol('traceId') same as apiTraceId which is actually Entry Span ID,
      exitCallsBreakup: trace.exitCallsBreakup as Dictionary<string>
    };
  }
}

export interface ApiTraceDetailData extends TraceDetailData {
  entrySpanId: string;
  exitCallsBreakup: Dictionary<string>;
}
