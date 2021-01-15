import { DateCoercer, Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, PLAIN_OBJECT_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Span, spanIdKey } from '../../../../graphql/model/schema/span';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import {
  SpanGraphQlQueryHandlerService,
  SPAN_GQL_REQUEST
} from '../../../../graphql/request/handlers/spans/span-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../../../data/graphql/graphql-data-source.model';
import { GraphQlTimeRange } from './../../../../graphql/model/schema/timerange/graphql-time-range';

@Model({
  type: 'span-detail-data-source'
})
export class SpanDetailDataSourceModel extends GraphQlDataSourceModel<SpanDetailData> {
  @ModelProperty({
    key: 'span',
    required: true,
    type: PLAIN_OBJECT_PROPERTY.type
  })
  public span!: Span;

  @ModelProperty({
    key: 'start-time',
    required: false,
    type: UNKNOWN_PROPERTY.type
  })
  public startTime?: unknown;

  private readonly attributeSpecBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  protected getSpanAttributes(): string[] {
    return ['statusCode', 'spanTags', 'traceId'];
  }

  public getData(): Observable<SpanDetailData> {
    return this.query<SpanGraphQlQueryHandlerService>({
      requestType: SPAN_GQL_REQUEST,
      id: this.span[spanIdKey],
      timestamp: this.dateCoercer.coerce(this.startTime ?? this.span.startTime),
      properties: this.getSpanAttributes().map(attribute =>
        this.attributeSpecBuilder.attributeSpecificationForKey(attribute)
      )
    }).pipe(mergeMap(span => this.mapResponseObject(span)));
  }

  private mapResponseObject(span: Span | undefined): Observable<SpanDetailData> {
    if (span === undefined) {
      return EMPTY;
    }

    return of(this.constructSpanDetail(span));
  }

  protected constructSpanDetail(span: Span): SpanDetailData {
    return {
      id: span[spanIdKey],
      traceId: span.traceId as string,
      statusCode: span.statusCode as string,
      tags: span.spanTags as Dictionary<unknown>
    };
  }

  protected getTimeRangeOrThrow(): GraphQlTimeRange {
    const startTimeAsDate = this.dateCoercer.coerce(this.startTime ?? this.span.startTime);

    return startTimeAsDate !== undefined
      ? new GraphQlTimeRange(startTimeAsDate.getTime() - 1, startTimeAsDate.getTime() + 1)
      : super.getTimeRangeOrThrow();
  }
}

export interface SpanDetailData {
  id: string;
  traceId: string;
  statusCode: string;
  tags: Dictionary<unknown>;
}
