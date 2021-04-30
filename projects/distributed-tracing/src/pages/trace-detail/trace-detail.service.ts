import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateCoercer, DateFormatMode, DateFormatter, ReplayObservable } from '@hypertrace/common';

import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
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
  private static readonly START_TIME_PARAM_NAME: string = 'startTime';

  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  private readonly routeIds$: ReplayObservable<TraceDetailRouteIdParams>;
  private readonly destroyed$: Subject<void> = new Subject();

  public constructor(
    route: ActivatedRoute,
    private readonly metadataService: MetadataService,
    private readonly graphQlQueryService: GraphQlRequestService
  ) {
    this.routeIds$ = route.paramMap.pipe(
      map(paramMap => ({
        traceId: paramMap.get(this.getTraceIdParamName())!,
        spanId: paramMap.get(this.getSpanIdParamName()) as string | undefined,
        startTime: paramMap.get(this.getStartTimeParamName()) ?? undefined
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

  protected getStartTimeParamName(): string {
    return TraceDetailService.START_TIME_PARAM_NAME;
  }

  public fetchTraceDetails(): Observable<TraceDetails> {
    return this.routeIds$.pipe(
      switchMap(routeIds =>
        this.fetchTrace(routeIds.traceId, routeIds.spanId, routeIds.startTime).pipe(
          map(trace => [trace, routeIds] as [Trace, TraceDetailRouteIdParams])
        )
      ),
      switchMap(([trace, routeIds]) =>
        this.metadataService.getAttribute(trace[traceTypeKey], 'duration').pipe(
          map(durationAttribute => ({
            id: trace[traceIdKey],
            entrySpanId: routeIds.spanId,
            startTime: routeIds.startTime,
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

  private fetchTrace(traceId: string, spanId?: string, startTime?: string | number): Observable<Trace> {
    return this.graphQlQueryService.query<TraceGraphQlQueryHandlerService, Trace>({
      requestType: TRACE_GQL_REQUEST,
      traceId: traceId,
      timestamp: this.dateCoercer.coerce(startTime),
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
    )} for ${trace.duration as string} ${units ?? ''}`.trim();
  }

  private buildTitleString(trace: Trace): string {
    if (trace.spans?.length === 1) {
      const entrySpan = trace.spans[0];

      return `${entrySpan.serviceName as string} ${(entrySpan.displaySpanName as string) ?? ''}`.trim();
    }

    return '';
  }
}

interface TraceDetailRouteIdParams {
  traceId: string;
  spanId?: string;
  startTime?: string;
}

export interface TraceDetails {
  id: string;
  entrySpanId?: string;
  startTime?: string;
  type: TraceType;
  timeString: string;
  titleString: string;
}
