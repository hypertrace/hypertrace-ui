import { DateCoercer, Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttributeMetadata } from '../../../../graphql/model/metadata/attribute-metadata';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { Span, spanIdKey, SpanType, SPAN_SCOPE } from '../../../../graphql/model/schema/span';
import { Trace, traceIdKey } from '../../../../graphql/model/schema/trace';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../../../graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { LogEventsService } from '../../../../services/log-events/log-events.service';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { LogEvent, WaterfallData } from '../../../widgets/waterfall/waterfall/waterfall-chart';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';

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

  @ModelInject(LogEventsService)
  private readonly logEventsService!: LogEventsService;

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

  protected getLogEventAttributes(): string[] {
    return ['attributes', 'timestamp', 'summary'];
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
      ),
      logEventProperties: this.getLogEventAttributes().map(attribute =>
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
      protocolName: span.protocolName as string,
      apiName: span.displaySpanName as string,
      spanType: span.type as SpanType,
      tags: span.spanTags as Dictionary<unknown>,
      errorCount: span.errorCount as number,
      logEvents: this.logEventsService.getLogEventsWithSpanStartTime(
        span.logEvents as Dictionary<LogEvent[]>,
        span.startTime as number
      )
    };
  }
}
