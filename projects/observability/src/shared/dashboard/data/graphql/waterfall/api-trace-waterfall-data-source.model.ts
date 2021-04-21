import { DateCoercer, Dictionary } from '@hypertrace/common';
import {
  AttributeMetadata,
  GraphQlDataSourceModel,
  MetadataService,
  Span,
  spanIdKey,
  SpanType,
  SPAN_SCOPE,
  SpecificationBuilder,
  Trace,
  TraceGraphQlQueryHandlerService,
  traceIdKey,
  TRACE_GQL_REQUEST,
  WaterfallData
} from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';

@Model({
  type: 'api-trace-waterfall-data-source'
})
export class ApiTraceWaterfallDataSourceModel extends GraphQlDataSourceModel<WaterfallData[]> {
  @ModelProperty({
    key: 'trace-id',
    required: true,
    type: STRING_PROPERTY.type
  })
  public traceId!: string;

  @ModelProperty({
    key: 'start-time',
    required: true,
    type: UNKNOWN_PROPERTY.type
  })
  public startTime?: unknown;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public getData(): Observable<WaterfallData[]> {
    return combineLatest([this.getTraceData(), this.getDurationAttribute()]).pipe(
      map(combinedData => this.mapResponseObject(combinedData[0], combinedData[1]))
    );
  }

  protected getSpanAttributes(): string[] {
    return [
      'displayEntityName',
      'displaySpanName',
      'duration',
      'endTime',
      'parentSpanId',
      'protocolName',
      'spanTags',
      'startTime',
      'type',
      'errorCount'
    ];
  }

  private getTraceData(): Observable<Trace | undefined> {
    return this.query<TraceGraphQlQueryHandlerService>({
      requestType: TRACE_GQL_REQUEST,
      traceType: ObservabilityTraceType.Api,
      traceId: this.traceId,
      spanLimit: 1000,
      timestamp: this.dateCoercer.coerce(this.startTime),
      traceProperties: [],
      spanProperties: this.getSpanAttributes().map(attribute =>
        this.specificationBuilder.attributeSpecificationForKey(attribute)
      )
    });
  }

  private getDurationAttribute(): Observable<AttributeMetadata> {
    return this.metadataService.getAttribute(SPAN_SCOPE, 'duration');
  }

  private mapResponseObject(trace: Trace | undefined, duration: AttributeMetadata): WaterfallData[] {
    if (trace === undefined || trace.spans === undefined || trace.spans.length === 0) {
      return [];
    }
    const spans = trace.spans;

    return spans.map(span => this.constructWaterfallData(span, trace, duration));
  }

  protected constructWaterfallData(span: Span, trace: Trace, duration: AttributeMetadata): WaterfallData {
    return {
      id: span[spanIdKey],
      isCurrentExecutionEntrySpan: trace[traceIdKey] === span[spanIdKey],
      parentId: span.parentSpanId as string,
      startTime: span.startTime as number,
      endTime: span.endTime as number,
      duration: {
        value: span.duration as number,
        units: duration.units
      },
      serviceName: span.displayEntityName as string,
      name: span.displaySpanName as string,
      protocolName: span.protocolName as string,
      spanType: span.type as SpanType,
      tags: span.spanTags as Dictionary<unknown>,
      errorCount: span.errorCount as number
    };
  }
}
