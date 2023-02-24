import { Injectable } from '@angular/core';
import { TimeDuration, TimeRangeService, TimeUnit } from '@hypertrace/common';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { GlobalGraphQlFilterService } from '../../../model/schema/filter/global-graphql-filter.service';
import { GraphQlFilter } from '../../../model/schema/filter/graphql-filter';
import { GraphQlIdFilter } from '../../../model/schema/filter/id/graphql-id-filter';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { resolveTraceType, TraceType } from '../../../model/schema/trace';
import { GraphQlArgumentBuilder } from '../../builders/argument/graphql-argument-builder';

@Injectable({ providedIn: 'root' })
export class ExportSpansGraphQlQueryHandlerService
  implements GraphQlQueryHandler<GraphQlExportSpansRequest, string | undefined>
{
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;
  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();

  public constructor(
    private readonly timeRangeService: TimeRangeService,
    private readonly globalGraphQlFilterService: GlobalGraphQlFilterService
  ) {}

  public matchesRequest(request: unknown): request is GraphQlExportSpansRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlExportSpansRequest>).requestType === EXPORT_SPANS_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlExportSpansRequest): GraphQlSelection {
    const timeRange = this.buildTimeRange(request.timestamp);

    return {
      path: 'exportSpans',
      arguments: [
        this.argBuilder.forLimit(request.limit),
        this.argBuilder.forTimeRange(timeRange),
        ...this.argBuilder.forFilters(
          this.globalGraphQlFilterService.mergeGlobalFilters(resolveTraceType(request.traceType), [
            this.buildTraceIdFilter(request)
          ])
        )
      ],
      children: [
        {
          path: 'result'
        }
      ]
    };
  }

  public convertResponse(response: ExportSpansResponse): string | undefined {
    return response.result;
  }

  private buildTraceIdFilter(request: GraphQlExportSpansRequest): GraphQlFilter {
    return new GraphQlIdFilter(request.traceId, resolveTraceType(request.traceType));
  }

  protected buildTimeRange(timestamp?: Date): GraphQlTimeRange {
    const duration = new TimeDuration(30, TimeUnit.Minute);

    return timestamp
      ? new GraphQlTimeRange(timestamp.getTime() - duration.toMillis(), timestamp.getTime() + duration.toMillis())
      : GraphQlTimeRange.fromTimeRange(this.timeRangeService.getCurrentTimeRange());
  }
}

export const EXPORT_SPANS_GQL_REQUEST = Symbol('GraphQL Export Spans Request');

export interface GraphQlExportSpansRequest {
  requestType: typeof EXPORT_SPANS_GQL_REQUEST;
  traceType?: TraceType;
  traceId: string;
  limit: number;
  timestamp?: Date;
}

export interface ExportSpansResponse {
  result: string;
}
