import { DateCoercer } from '@hypertrace/common';
import { ARRAY_PROPERTY, Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Span } from '../../../../../shared/graphql/model/schema/span';
import { Specification } from '../../../../../shared/graphql/model/schema/specifier/specification';
import {
  SpanGraphQlQueryHandlerService,
  SPAN_GQL_REQUEST
} from '../../../../../shared/graphql/request/handlers/spans/span-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
@Model({
  type: 'span-data-source'
})
export class SpanDataSourceModel extends GraphQlDataSourceModel<Span> {
  @ModelProperty({
    key: 'span-id',
    required: true,
    type: STRING_PROPERTY.type
  })
  public spanId!: string;

  @ModelProperty({
    key: 'start-time',
    required: false,
    type: UNKNOWN_PROPERTY.type
  })
  public startTime: unknown;

  @ModelProperty({
    key: 'attributes',
    type: ARRAY_PROPERTY.type,
    required: false
  })
  public specifications: Specification[] = [];

  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public getData(): Observable<Span> {
    return this.query<SpanGraphQlQueryHandlerService>({
      requestType: SPAN_GQL_REQUEST,
      id: this.spanId,
      timestamp: this.dateCoercer.coerce(this.startTime),
      properties: this.specifications
    }).pipe(mergeMap(span => this.mapResponseObject(span)));
  }

  private mapResponseObject(span: Span | undefined): Observable<Span> {
    if (span === undefined) {
      return EMPTY;
    }

    return of(span);
  }
}
