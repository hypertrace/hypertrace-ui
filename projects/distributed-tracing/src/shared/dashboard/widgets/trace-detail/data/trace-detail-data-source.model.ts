import { Dictionary } from '@hypertrace/common';
import { ARRAY_PROPERTY, Model, ModelProperty, PLAIN_OBJECT_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Trace, traceIdKey, traceTypeKey } from '../../../../graphql/model/schema/trace';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../../../graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../../../data/graphql/graphql-data-source.model';

@Model({
  type: 'trace-detail-data-source'
})
export class TraceDetailDataSourceModel extends GraphQlDataSourceModel<TraceDetailData> {
  @ModelProperty({
    key: 'trace',
    required: true,
    type: PLAIN_OBJECT_PROPERTY.type
  })
  public trace!: Trace;

  @ModelProperty({
    key: 'attributes',
    type: ARRAY_PROPERTY.type
  })
  public attributes: string[] = [];

  private readonly attributeSpecBuilder: SpecificationBuilder = new SpecificationBuilder();

  public getData(): Observable<TraceDetailData> {
    return this.query<TraceGraphQlQueryHandlerService>({
      requestType: TRACE_GQL_REQUEST,
      traceType: this.trace[traceTypeKey],
      traceId: this.trace[traceIdKey],
      spanLimit: 0,
      timeRange: this.getTimeRangeOrThrow(),
      traceProperties: this.getTraceAttributes().map(attribute =>
        this.attributeSpecBuilder.attributeSpecificationForKey(attribute)
      )
    }).pipe(mergeMap(trace => this.mapResponseObject(trace)));
  }

  protected getTraceAttributes(): string[] {
    return ['tags', 'statusCode', ...this.attributes];
  }

  private mapResponseObject(trace: Trace | undefined): Observable<TraceDetailData> {
    if (trace === undefined) {
      return EMPTY;
    }

    return of(this.constructTraceDetailData(trace));
  }

  protected constructTraceDetailData(trace: Trace): TraceDetailData {
    console.debug('trace', trace);

    return {
      id: trace[traceIdKey],
      traceId: trace.traceId as string, // traceId is real Trace ID. NOT Symbol('traceId').
      entrySpanId: trace.apiTraceId as string, // Symbol('traceId') same as apiTraceId which is actually Entry Span ID
      statusCode: trace.statusCode as string,
      tags: trace.tags as Dictionary<unknown>,
      requestUrl: trace.requestUrl as string
    };
  }
}

export interface TraceDetailData {
  id: string;
  traceId: string;
  entrySpanId: string;
  statusCode: string;
  tags: Dictionary<unknown>;
  requestUrl: string;
}
