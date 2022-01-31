import { Dictionary, forkJoinSafeEmpty, getPercentage, LoggerService, TimeDuration } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Summary } from '../../../../../components/cartesian/chart';
import { MetricTimeseriesInterval } from '../../../../../graphql/model/metric/metric-timeseries';
import { MetricAggregation, MetricAggregationType } from '../../../../../graphql/model/metrics/metric-aggregation';
import { Entity } from '../../../../../graphql/model/schema/entity';
import { findEntityFilterOrThrow } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { MetricAggregationSpecification } from '../../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { Specification } from '../../../../../graphql/model/schema/specifier/specification';
import { MetricSpecification } from '../../../../../graphql/model/specifications/metric-specification';
import { ObservabilitySpecificationBuilder } from '../../../../../graphql/request/builders/selections/observability-specification-builder';
import {
  EntityGraphQlQueryHandlerService,
  ENTITY_GQL_REQUEST,
  GraphQlEntityRequest
} from '../../../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { MetricSeries, MetricSeriesDataFetcher } from '../../../../widgets/charts/cartesian-widget/series.model';
import { GraphQlDataSourceModel } from '../../graphql-data-source.model';

@Model({
  type: 'entity-error-percentage-timeseries-data-source'
})
export class EntityErrorPercentageTimeseriesDataSourceModel extends GraphQlDataSourceModel<
  MetricSeriesDataFetcher<MetricTimeseriesInterval>
> {
  private readonly errorCountSpec: MetricAggregationSpecification =
    new ObservabilitySpecificationBuilder().metricAggregationSpecForKey('errorCount', MetricAggregationType.Sum);

  private readonly callCountSpec: MetricAggregationSpecification =
    new ObservabilitySpecificationBuilder().metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum);

  @ModelInject(LoggerService)
  private readonly loggerService!: LoggerService;

  public getData(): Observable<MetricSeriesDataFetcher<MetricTimeseriesInterval>> {
    return of({
      getData: interval => this.getAllData(interval)
    });
  }

  private getAllData(interval: TimeDuration): Observable<MetricSeries<MetricTimeseriesInterval>> {
    return forkJoinSafeEmpty({
      errorCountIntervals: this.getErrorCountSeries(interval),
      callCountIntervals: this.getCallCountSeries(interval),
      errorCountSummary: this.getErrorCountSummary(),
      callCountSummary: this.getCallCountSummary()
    }).pipe(
      map(data => ({
        intervals: this.toPercentageIntervals(data.errorCountIntervals, data.callCountIntervals),
        summary: this.toPercentageSummary(data.errorCountSummary, data.callCountSummary),
        units: '%'
      }))
    );
  }

  private toPercentageIntervals(
    errorIntervals: MetricTimeseriesInterval[],
    callIntervals: MetricTimeseriesInterval[]
  ): MetricTimeseriesInterval[] {
    if (errorIntervals.length !== callIntervals.length) {
      this.loggerService.warn('Unable to calculate percentile. Unequal interval length.');

      return [];
    }

    return callIntervals.map((callInterval, index) => ({
      value: getPercentage(errorIntervals[index].value, callInterval.value),
      timestamp: callInterval.timestamp
    }));
  }

  private toPercentageSummary(errorSummary: MetricAggregation, callSummary: MetricAggregation): Summary {
    return {
      value: getPercentage(errorSummary.value, callSummary.value),
      units: '%'
    };
  }

  private getErrorCountSeries(interval: TimeDuration): Observable<MetricTimeseriesInterval[]> {
    return this.fetchSpecificationData<MetricTimeseriesInterval[]>(
      new ObservabilitySpecificationBuilder().metricTimeseriesSpec(
        this.errorCountSpec.name,
        this.errorCountSpec.aggregation,
        interval
      )
    );
  }

  private getCallCountSeries(interval: TimeDuration): Observable<MetricTimeseriesInterval[]> {
    return this.fetchSpecificationData<MetricTimeseriesInterval[]>(
      new ObservabilitySpecificationBuilder().metricTimeseriesSpec(
        this.callCountSpec.name,
        this.callCountSpec.aggregation,
        interval
      )
    );
  }

  private getErrorCountSummary(): Observable<MetricAggregation> {
    return this.fetchSpecificationData<MetricAggregation>(this.errorCountSpec);
  }

  private getCallCountSummary(): Observable<MetricAggregation> {
    return this.fetchSpecificationData<MetricAggregation>(this.callCountSpec);
  }

  protected fetchSpecificationData<TResponse>(specification: MetricSpecification): Observable<TResponse> {
    return this.query<EntityGraphQlQueryHandlerService, Entity & Dictionary<TResponse>>(filters =>
      this.buildRequest(specification, filters)
    ).pipe(map(response => response[specification.resultAlias()]));
  }

  private buildRequest(specification: Specification, inheritedFilters: GraphQlFilter[]): GraphQlEntityRequest {
    const entityFilter = findEntityFilterOrThrow(inheritedFilters);

    return {
      requestType: ENTITY_GQL_REQUEST,
      properties: [specification],
      timeRange: this.getTimeRangeOrThrow(),
      entityType: entityFilter.type,
      id: entityFilter.id
    };
  }
}
