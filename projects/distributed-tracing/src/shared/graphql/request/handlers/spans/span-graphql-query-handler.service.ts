import { Injectable } from '@angular/core';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQlFieldFilter } from '../../../model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../../model/schema/filter/graphql-filter';
import { Span } from '../../../model/schema/span';
import { Specification } from '../../../model/schema/specifier/specification';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import {
  GraphQlSpansRequest,
  SpansGraphQlQueryHandlerService,
  SPANS_GQL_REQUEST
} from './spans-graphql-query-handler.service';

@Injectable({ providedIn: 'root' })
export class SpanGraphQlQueryHandlerService implements GraphQlQueryHandler<GraphQlSpanRequest, Span | undefined> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  public constructor(private readonly spansGraphQlQueryHandlerService: SpansGraphQlQueryHandlerService) {}

  public matchesRequest(request: unknown): request is GraphQlSpanRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlSpanRequest>).requestType === SPAN_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlSpanRequest): GraphQlSelection {
    return this.spansGraphQlQueryHandlerService.convertRequest(this.asSpansRequest(request));
  }

  public convertResponse(response: unknown, request: GraphQlSpanRequest): Observable<Span | undefined> {
    return this.spansGraphQlQueryHandlerService
      .convertResponse(response, this.asSpansRequest(request))
      .pipe(map(spanResponse => spanResponse.results[0]));
  }

  private asSpansRequest(request: GraphQlSpanRequest): GraphQlSpansRequest {
    return {
      requestType: SPANS_GQL_REQUEST,
      limit: 1,
      timeRange: request.timeRange,
      properties: request.properties,
      filters: [this.buildIdFilter(request)]
    };
  }

  private buildIdFilter(request: GraphQlSpanRequest): GraphQlFilter {
    return new GraphQlFieldFilter('id', GraphQlOperatorType.Equals, request.id);
  }
}

export const SPAN_GQL_REQUEST = Symbol('GraphQL Span Request');

export interface GraphQlSpanRequest {
  requestType: typeof SPAN_GQL_REQUEST;
  id: string;
  properties: Specification[];
  timeRange: GraphQlTimeRange;
}
