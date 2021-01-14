import { Injectable } from '@angular/core';
import { Dictionary, TimeDuration, TimeRangeService, TimeUnit } from '@hypertrace/common';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { isEmpty, isNil } from 'lodash-es';
import { GraphQlFieldFilter } from '../../../model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../../model/schema/filter/graphql-filter';
import { GraphQlIdFilter } from '../../../model/schema/filter/id/graphql-id-filter';
import { Span, spanIdKey } from '../../../model/schema/span';
import { Specification } from '../../../model/schema/specifier/specification';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { resolveTraceType, Trace, traceIdKey, TraceType, traceTypeKey } from '../../../model/schema/trace';
import { GraphQlArgumentBuilder } from '../../builders/argument/graphql-argument-builder';
import { GraphQlSelectionBuilder } from '../../builders/selections/graphql-selection-builder';

@Injectable({ providedIn: 'root' })
export class TraceGraphQlQueryHandlerService implements GraphQlQueryHandler<GraphQlTraceRequest, Trace | undefined> {
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  private readonly tracesKey: string = 'traces';
  private readonly spansKey: string = 'spans';
  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();

  public constructor(private readonly timeRangeService: TimeRangeService) {}

  public matchesRequest(request: unknown): request is GraphQlTraceRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlTraceRequest>).requestType === TRACE_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlTraceRequest): Map<string, GraphQlSelection> {
    const requestMap: Map<string, GraphQlSelection> = new Map();
    const timeRange = this.buildTimeRange(request.timestamp);
    const traces = {
      path: 'traces',
      arguments: [
        this.argBuilder.forTraceType(resolveTraceType(request.traceType)),
        this.argBuilder.forLimit(1),
        this.argBuilder.forTimeRange(timeRange),
        ...this.argBuilder.forFilters([this.buildTraceIdFilter(request)])
      ],
      children: [
        {
          path: 'results',
          children: [{ path: 'id' }, ...this.selectionBuilder.fromSpecifications(request.traceProperties)]
        }
      ]
    };

    requestMap.set(this.tracesKey, traces);

    if (!isEmpty(request.spanProperties)) {
      const spans = {
        path: 'spans',
        arguments: [
          this.argBuilder.forLimit(request.spanLimit),
          this.argBuilder.forTimeRange(timeRange),
          ...this.argBuilder.forFilters([...this.buildSpansFilter(request)])
        ],
        children: [
          {
            path: 'results',
            children: [{ path: 'id' }, ...this.selectionBuilder.fromSpecifications(request.spanProperties!)]
          }
        ]
      };

      requestMap.set(this.spansKey, spans);
    }

    return requestMap;
  }

  public convertResponse(
    response: Map<string, TraceServerResponse | SpansServerResponse>,
    request: GraphQlTraceRequest
  ): Trace | undefined {
    const traceResponse = response.get(this.tracesKey) as TraceServerResponse;
    const spansResponse = response.get(this.spansKey) as SpansServerResponse | undefined;

    if (traceResponse.results.length === 0) {
      return undefined;
    }

    const trace = this.normalizeTrace(traceResponse.results[0], request);
    if (spansResponse) {
      trace.spans = this.normalizeSpans(spansResponse, request);
    }

    return trace;
  }

  private normalizeTrace(rawResult: TraceServerResult, request: GraphQlTraceRequest): Trace {
    const trace: Trace = {
      [traceIdKey]: rawResult.id as string,
      [traceTypeKey]: resolveTraceType(request.traceType)
    };

    request.traceProperties.forEach(
      property => (trace[property.resultAlias()] = property.extractFromServerData(rawResult))
    );

    return trace;
  }

  private normalizeSpans(rawResult: SpansServerResponse, request: GraphQlTraceRequest): Span[] {
    const spans: Span[] = [];

    rawResult.results.forEach(spanRawResult => {
      const span: Span = {
        [spanIdKey]: spanRawResult.id as string
      };

      (request.spanProperties || []).forEach(property => {
        span[property.resultAlias()] = property.extractFromServerData(spanRawResult);
      });

      spans.push(span);
    });

    return spans;
  }

  private buildTraceIdFilter(request: GraphQlTraceRequest): GraphQlFilter {
    return new GraphQlIdFilter(request.traceId, resolveTraceType(request.traceType));
  }

  private buildSpansFilter(request: GraphQlTraceRequest): GraphQlFilter[] {
    const filters = [this.buildTraceIdFilter(request)];

    if (!isNil(request.spanId)) {
      filters.push(new GraphQlFieldFilter('id', GraphQlOperatorType.Equals, request.spanId));
    }

    return filters;
  }

  protected buildTimeRange(timestamp?: Date): GraphQlTimeRange {
    let timeRange;
    if (timestamp) {
      const duration = new TimeDuration(30, TimeUnit.Minute);
      timeRange = {
        startTime: timestamp.getTime() - duration.toMillis(),
        endTime: timestamp.getTime() + duration.toMillis()
      };
    } else {
      timeRange = this.timeRangeService.getCurrentTimeRange();
    }

    return new GraphQlTimeRange(timeRange.startTime, timeRange.endTime);
  }
}

export const TRACE_GQL_REQUEST = Symbol('GraphQL Trace Request');

export interface GraphQlTraceRequest {
  requestType: typeof TRACE_GQL_REQUEST;
  traceType?: TraceType;
  traceId: string;
  timestamp?: Date;
  traceProperties: Specification[];
  spanLimit: number;
  spanId?: string;
  spanProperties?: Specification[];
}

interface TraceServerResponse {
  results: TraceServerResult[];
}

interface SpansServerResponse {
  results: Dictionary<unknown>[];
}

interface TraceServerResult {
  [key: string]: unknown;
}
