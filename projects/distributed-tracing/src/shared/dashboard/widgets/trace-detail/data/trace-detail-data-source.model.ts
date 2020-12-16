import { DateCoercer, Dictionary } from '@hypertrace/common';
import { ARRAY_PROPERTY, Model, ModelProperty, PLAIN_OBJECT_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Trace, traceIdKey, traceTypeKey } from '../../../../graphql/model/schema/trace';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../../../graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../../../data/graphql/graphql-data-source.model';
import { GraphQlTimeRange } from './../../../../graphql/model/schema/timerange/graphql-time-range';

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
    key: 'start-time',
    required: false,
    type: UNKNOWN_PROPERTY.type
  })
  public startTime?: unknown;

  @ModelProperty({
    key: 'attributes',
    type: ARRAY_PROPERTY.type
  })
  public attributes: string[] = [];

  private readonly attributeSpecBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

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
    return {
      traceId: trace[traceIdKey],
      statusCode: trace.statusCode as string,
      tags: trace.tags as Dictionary<unknown>,
      requestUrl: trace.requestUrl as string
    };
  }

  protected getTimeRangeOrThrow(): GraphQlTimeRange {
    const startTimeAsDate = this.dateCoercer.coerce(this.startTime ?? this.trace.startTime);

    return startTimeAsDate !== undefined
      ? new GraphQlTimeRange(startTimeAsDate.getTime() - 1, startTimeAsDate.getTime() + 1)
      : super.getTimeRangeOrThrow();
  }
}

export interface TraceDetailData {
  traceId: string;
  statusCode: string;
  tags: Dictionary<unknown>;
  requestUrl: string;
}
