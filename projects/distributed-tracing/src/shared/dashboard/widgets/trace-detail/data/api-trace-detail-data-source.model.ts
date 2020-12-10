import { Model } from '@hypertrace/hyperdash';
import { Trace } from '../../../../graphql/model/schema/trace';

import { TraceDetailData, TraceDetailDataSourceModel } from './trace-detail-data-source.model';

@Model({
  type: 'api-trace-detail-data-source'
})
export class ApiTraceDetailDataSourceModel extends TraceDetailDataSourceModel {
  protected getTraceAttributes(): string[] {
    return [...super.getTraceAttributes(), 'apiTraceId'];
  }

  protected constructTraceDetailData(trace: Trace): ApiTraceDetailData {
    return {
      ...super.constructTraceDetailData(trace),
      entrySpanId: trace.apiTraceId as string // Symbol('traceId') same as apiTraceId which is actually Entry Span ID
    };
  }
}

export interface ApiTraceDetailData extends TraceDetailData {
  entrySpanId: string;
}
