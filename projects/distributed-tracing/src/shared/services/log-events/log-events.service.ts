import { Injectable } from '@angular/core';
import { DateCoercer, Dictionary } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ObservabilityTraceType } from '@hypertrace/observability';
import { isEmpty } from 'lodash-es';
import { Observable } from 'rxjs';
import { LogEvent } from '../../dashboard/widgets/waterfall/waterfall/waterfall-chart';
import { Span } from '../../graphql/model/schema/span';
import { Trace, TraceType, traceTypeKey } from '../../graphql/model/schema/trace';
import { SpecificationBuilder } from '../../graphql/request/builders/specification/specification-builder';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../graphql/request/handlers/traces/trace-graphql-query-handler.service';

@Injectable({ providedIn: 'root' })
export class LogEventsService {
  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();
  private readonly logEventProperties: string[] = ['attributes', 'timestamp', 'summary', 'spanId'];
  private readonly spanPropertiesForTrace: string[] = ['startTime', 'serviceName', 'displaySpanName', 'protocolName'];
  private readonly spanPropertiesForApiTrace: string[] = [
    'startTime',
    'displayEntityName',
    'displaySpanName',
    'protocolName'
  ];

  public constructor(private readonly graphQlQueryService: GraphQlRequestService) {}

  public getLogEventsWithSpanStartTime(logEventsObject: Dictionary<LogEvent[]>, startTime: number): LogEvent[] {
    if (isEmpty(logEventsObject) || isEmpty(logEventsObject.results)) {
      return [];
    }

    return logEventsObject.results.map(logEvent => ({
      ...logEvent,
      spanStartTime: startTime
    }));
  }

  public getLogEventsGqlResponseForTrace(
    traceId: string,
    startTime?: string,
    traceType?: TraceType
  ): Observable<Trace> {
    return this.graphQlQueryService.query<TraceGraphQlQueryHandlerService, Trace>({
      requestType: TRACE_GQL_REQUEST,
      traceType: traceType,
      traceId: traceId,
      timestamp: this.dateCoercer.coerce(startTime),
      traceProperties: [],
      spanProperties: (traceType === ObservabilityTraceType.Api
        ? this.spanPropertiesForApiTrace
        : this.spanPropertiesForTrace
      ).map(property => this.specificationBuilder.attributeSpecificationForKey(property)),
      logEventProperties: this.logEventProperties.map(property =>
        this.specificationBuilder.attributeSpecificationForKey(property)
      ),
      spanLimit: 1000
    });
  }

  public mapLogEvents(trace: Trace): LogEvent[] {
    return (trace.spans ?? [])
      .map((span: Span) =>
        (span.logEvents as Dictionary<LogEvent[]>).results.map(logEvent => ({
          ...logEvent,
          $$spanName: {
            serviceName: trace[traceTypeKey] === ObservabilityTraceType.Api ? span.displayEntityName : span.serviceName,
            protocolName: span.protocolName,
            apiName: span.displaySpanName
          },
          spanStartTime: span.startTime as number
        }))
      )
      .flat();
  }
}
