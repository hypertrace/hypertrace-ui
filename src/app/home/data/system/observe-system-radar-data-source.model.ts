import { forkJoinSafeEmpty } from '@hypertrace/common';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import {
  EXPLORE_GQL_REQUEST,
  ExploreGraphQlQueryHandlerService,
  ExploreSpecification,
  ExploreSpecificationBuilder,
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
      this.fetchTotalCalls(timeRange),
      this.fetchCallsPerSecond(timeRange),
      this.fetchTotalErrors(timeRange),
      this.fetchErrorsPerSecond(timeRange)
    ]).pipe(
      map(([totalCalls, callsPerSecond, totalErrors, errorsPerSecond]) => [
        this.buildTotalCallsRadarPoint(totalCalls),
        this.buildCallsPerSecondRadarPoint(callsPerSecond),
        this.buildTotalErrorsRadarPoint(totalErrors),
        this.buildErrorsPerSecondRadarPoint(errorsPerSecond)
      ])
    );
  }

  private fetchTotalCalls(timeRange: GraphQlTimeRange): Observable<number> {
    const specification: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(
      'calls',
      MetricAggregationType.Sum
    );

    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
      this.buildExploreRequest(timeRange, specification)
    ).pipe(
      map((response: GraphQlExploreResponse) => response.results[0][specification.resultAlias()]),
      map(value => value.value as number)
    );
  }

  private buildTotalCallsRadarPoint(totalCalls: number): RadarPoint {
    return this.buildRadarPoint('Total Calls', totalCalls);
  }

  private fetchTotalErrors(timeRange: GraphQlTimeRange): Observable<number> {
    const specification: ExploreSpecification = this.specBuilder.exploreSpecificationForKey(
      'errorCount',
      MetricAggregationType.Sum
    );

    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
      this.buildExploreRequest(timeRange, specification)
    ).pipe(
      map((response: GraphQlExploreResponse) => response.results[0][specification.resultAlias()]),
      map(value => value.value as number)
    );
  }

  private buildTotalErrorsRadarPoint(totalErrors: number): RadarPoint {
    return this.buildRadarPoint('Total Errors', totalErrors);
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

    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
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

    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>(() =>
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
