import { DateCoercer, Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttributeMetadata } from '../../../../graphql/model/metadata/attribute-metadata';
import { spanIdKey, SpanType, SPAN_SCOPE } from '../../../../graphql/model/schema/span';
import { Specification } from '../../../../graphql/model/schema/specifier/specification';
import { Trace } from '../../../../graphql/model/schema/trace';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../../../graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { WaterfallData } from '../../../widgets/waterfall/waterfall/waterfall-chart';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';

@Model({
  type: 'trace-waterfall-data-source'
})
export class TraceWaterfallDataSourceModel extends GraphQlDataSourceModel<WaterfallData[]> {
  @ModelProperty({
    key: 'trace-id',
    required: true,
    type: STRING_PROPERTY.type
  })
  public traceId!: string;

  @ModelProperty({
    key: 'entry-span-id',
    required: false,
    type: STRING_PROPERTY.type
  })
  public entrySpanId?: string;

  @ModelProperty({
    key: 'start-time',
    required: false,
    type: UNKNOWN_PROPERTY.type
  })
  public startTime?: unknown;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  protected readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  protected readonly spanSpecifications: Specification[] = [
    this.specificationBuilder.attributeSpecificationForKey('displaySpanName'),
    this.specificationBuilder.attributeSpecificationForKey('duration'),
    this.specificationBuilder.attributeSpecificationForKey('endTime'),
    this.specificationBuilder.attributeSpecificationForKey('parentSpanId'),
    this.specificationBuilder.attributeSpecificationForKey('serviceName'),
    this.specificationBuilder.attributeSpecificationForKey('spanTags'),
    this.specificationBuilder.attributeSpecificationForKey('startTime'),
    this.specificationBuilder.attributeSpecificationForKey('type'),
    this.specificationBuilder.attributeSpecificationForKey('traceId'),
    this.specificationBuilder.attributeSpecificationForKey('errorCount')
  ];

  public getData(): Observable<WaterfallData[]> {
    return combineLatest([this.getTraceData(), this.getDurationAttribute()]).pipe(
      map(combinedData => this.mapResponseObject(combinedData[0], combinedData[1]))
    );
  }

  private getTraceData(): Observable<Trace | undefined> {
    return this.query<TraceGraphQlQueryHandlerService>({
      requestType: TRACE_GQL_REQUEST,
      traceId: this.traceId,
      spanLimit: 1000,
      timestamp: this.dateCoercer.coerce(this.startTime),
      traceProperties: [],
      spanProperties: this.spanSpecifications
    });
  }

  private getDurationAttribute(): Observable<AttributeMetadata> {
    return this.metadataService.getAttribute(SPAN_SCOPE, 'duration');
  }

  protected mapResponseObject(trace: Trace | undefined, duration: AttributeMetadata): WaterfallData[] {
    if (trace === undefined || trace.spans === undefined || trace.spans.length === 0) {
      return [];
    }
    const spans = trace.spans;

    return spans.map(span => ({
      id: span[spanIdKey],
      isCurrentExecutionEntrySpan: span[spanIdKey] === this.entrySpanId,
      parentId: span.parentSpanId as string,
      startTime: span.startTime as number,
      endTime: span.endTime as number,
      duration: {
        value: span.duration as number,
        units: duration.units
      },
      name: span.displaySpanName as string,
      serviceName: span.serviceName as string,
      protocolName: span.protocolName as string,
      spanType: span.type as SpanType,
      tags: span.spanTags as Dictionary<unknown>,
      errorCount: span.errorCount as number
    }));
  }
}
