import { forkJoinSafeEmpty } from '@hypertrace/common';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import {
  ExploreGraphQlQueryHandlerService,
  ExploreSpecification,
  ExploreSpecificationBuilder,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResponse,
  ObservabilityTraceType,
  RadarDataSourceModel,
  RadarPoint
} from '@hypertrace/observability';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Model({
  type: 'observe-system-radar-data-source'
})
export class ObserveSystemRadarDataSourceModel extends RadarDataSourceModel {
  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  protected fetchData(timeRange: GraphQlTimeRange): Observable<RadarPoint[]> {
    return forkJoinSafeEmpty([
      this.fetchP99Latency(timeRange),
      this.fetchCallsPerSecond(timeRange),
      this.fetchAvgLatency(timeRange),
      this.fetchErrorsPerSecond(timeRange)
    ]).pipe(
      map(([totalCalls, callsPerSecond, totalErrors, errorsPerSecond]) => [
        this.buildP99LatencyRadarPoint(totalCalls),
        this.buildCallsPerSecondRadarPoint(callsPerSecond),
        this.buildAvgLatencyRadarPoint(totalErrors),
        this.buildErrorsPerSecondRadarPoint(errorsPerSecond)
      ])
    );
  }

  private fetchP99Latency(timeRange: GraphQlTimeRange): Observable<number> {
    const specification: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(
      'duration',
      MetricAggregationType.P99
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
      this.buildExploreRequest(timeRange, specification)
    ).pipe(
      map((response: GraphQlExploreResponse) => response.results[0][specification.resultAlias()]),
      map(value => value.value as number)
    );
  }

  private buildP99LatencyRadarPoint(p99Latency: number): RadarPoint {
    return this.buildRadarPoint('P99 Latency', p99Latency);
  }

  private fetchAvgLatency(timeRange: GraphQlTimeRange): Observable<number> {
    const specification: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(
      'duration',
      MetricAggregationType.Average
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
      this.buildExploreRequest(timeRange, specification)
    ).pipe(
      map((response: GraphQlExploreResponse) => response.results[0][specification.resultAlias()]),
      map(value => value.value as number)
    );
  }

  private buildAvgLatencyRadarPoint(avgLatency: number): RadarPoint {
    return this.buildRadarPoint('Avg Latency', avgLatency);
  }

  /*
   * Calls / second
   *
   * SELECT rate_sec(calls) FROM explore->API_TRACE
   */

  private fetchCallsPerSecond(timeRange: GraphQlTimeRange): Observable<number> {
    const specification: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(
      'calls',
      MetricAggregationType.AvgrateSecond
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
      this.buildExploreRequest(timeRange, specification)
    ).pipe(
      map((response: GraphQlExploreResponse) => response.results[0][specification.resultAlias()]),
      map(value => value.value as number)
    );
  }

  private buildCallsPerSecondRadarPoint(callsPerSecond: number): RadarPoint {
    return this.buildRadarPoint('Calls/Second', callsPerSecond);
  }

  /*
   * Errors / second
   *
   * SELECT rate_sec(errors) FROM explore->API_TRACE
   */

  private fetchErrorsPerSecond(timeRange: GraphQlTimeRange): Observable<number> {
    const specification: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(
      'errorCount',
      MetricAggregationType.AvgrateSecond
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
      this.buildExploreRequest(timeRange, specification)
    ).pipe(
      map((response: GraphQlExploreResponse) => response.results[0][specification.resultAlias()]),
      map(value => value.value as number)
    );
  }

  private buildErrorsPerSecondRadarPoint(errorsPerSecond: number): RadarPoint {
    return this.buildRadarPoint('Errors/Second', errorsPerSecond);
  }

  private buildExploreRequest(timeRange: GraphQlTimeRange, specification: ExploreSpecification): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: timeRange,
      context: ObservabilityTraceType.Api,
      limit: 1,
      selections: [specification]
    };
  }
}
