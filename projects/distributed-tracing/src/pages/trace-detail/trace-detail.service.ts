import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateFormatMode, DateFormatter, ReplayObservable, TimeRange, TimeRangeService } from '@hypertrace/common';

import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { GraphQlTimeRange } from '../../shared/graphql/model/schema/timerange/graphql-time-range';
import { Trace, traceIdKey, TraceType, traceTypeKey } from '../../shared/graphql/model/schema/trace';
import { SpecificationBuilder } from '../../shared/graphql/request/builders/specification/specification-builder';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../shared/graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { MetadataService } from '../../shared/services/metadata/metadata.service';

@Injectable()
export class TraceDetailService implements OnDestroy {
  private static readonly TRACE_ID_PARAM_NAME: string = 'id';
  private static readonly SPAN_ID_PARAM_NAME: string = 'spanId';

  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();

  private readonly routeIds$: ReplayObservable<TraceDetailRouteIdParams>;
  private readonly destroyed$: Subject<void> = new Subject();

  public constructor(
    route: ActivatedRoute,
    private readonly timeRangeService: TimeRangeService,
    private readonly metadataService: MetadataService,
    private readonly graphQlQueryService: GraphQlRequestService
  ) {
    this.routeIds$ = route.paramMap.pipe(
      map(paramMap => ({
        traceId: paramMap.get(this.getTraceIdParamName())!,
        spanId: paramMap.get(this.getSpanIdParamName()) as string | undefined
      })),
      takeUntil(this.destroyed$),
      shareReplay(1)
    );
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  protected getTraceIdParamName(): string {
    return TraceDetailService.TRACE_ID_PARAM_NAME;
  }

  protected getSpanIdParamName(): string {
    return TraceDetailService.SPAN_ID_PARAM_NAME;
  }

  public fetchTraceDetails(): Observable<TraceDetails> {
    return combineLatest([this.timeRangeService.getTimeRangeAndChanges(), this.routeIds$]).pipe(
      switchMap(([timeRange, routeIds]) =>
        this.fetchTrace(timeRange, routeIds.traceId, routeIds.spanId).pipe(
          map(trace => [trace, routeIds] as [Trace, TraceDetailRouteIdParams])
        )
      ),
      switchMap(([trace, routeIds]) =>
        this.metadataService.getAttribute(trace[traceTypeKey], 'duration').pipe(
          map(durationAttribute => ({
            id: trace[traceIdKey],
            entrySpanId: routeIds.spanId,
            type: trace[traceTypeKey],
            timeString: this.buildTimeString(trace, durationAttribute.units),
            titleString: this.buildTitleString(trace)
          }))
        )
      ),
      takeUntil(this.destroyed$),
      shareReplay(1)
    );
  }

  private fetchTrace(timeRange: TimeRange, traceId: string, spanId?: string): Observable<Trace> {
    return this.graphQlQueryService.queryImmediately<TraceGraphQlQueryHandlerService, Trace>({
      requestType: TRACE_GQL_REQUEST,
      traceId: traceId,
      timeRange: new GraphQlTimeRange(timeRange.startTime, timeRange.endTime),
      traceProperties: [
        this.specificationBuilder.attributeSpecificationForKey('startTime'),
        this.specificationBuilder.attributeSpecificationForKey('duration')
      ],
      spanId: spanId,
      spanProperties: [
        this.specificationBuilder.attributeSpecificationForKey('serviceName'),
        this.specificationBuilder.attributeSpecificationForKey('displaySpanName')
      ],
      spanLimit: 1
    });
  }

  private buildTimeString(trace: Trace, units: string): string {
    return `${new DateFormatter({ mode: DateFormatMode.DateAndTimeWithSeconds }).format(
      trace.startTime as number
    )} for ${trace.duration as string} ${units}`;
  }

  private buildTitleString(trace: Trace): string {
    if (trace.spans?.length === 1) {
      const entrySpan = trace.spans[0];

      return `${entrySpan.serviceName as string} ${entrySpan.displaySpanName as string}`;
    }

    return '';
  }
}

interface TraceDetailRouteIdParams {
  traceId: string;
  spanId?: string;
}
export interface TraceDetails {
  id: string;
  entrySpanId?: string;
  type: TraceType;
  timeString: string;
  titleString: string;
}
