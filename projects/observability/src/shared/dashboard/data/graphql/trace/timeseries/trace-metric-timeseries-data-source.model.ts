import { forkJoinSafeEmpty, TimeDuration } from '@hypertrace/common';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetricTimeseriesInterval } from '../../../../../graphql/model/metric/metric-timeseries';
import { ObservabilityTraceType } from '../../../../../graphql/model/schema/observability-traces';
import { ExploreSpecification } from '../../../../../graphql/model/schema/specifications/explore-specification';
import { GQL_EXPLORE_RESULT_INTERVAL_KEY, GraphQlExploreResult } from '../../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { MetricSeries, MetricSeriesDataFetcher } from '../../../../widgets/charts/cartesian-widget/series.model';
import { ExploreSelectionSpecificationModel } from '../../specifiers/explore-selection-specification.model';
import { TraceSeriesValuesDataSourceModel } from '../trace-series-values-data-source.model';

@Model({
  type: 'trace-metric-timeseries-data-source'
})
export class TraceMetricTimeseriesDataSourceModel extends TraceSeriesValuesDataSourceModel<
  MetricSeriesDataFetcher<MetricTimeseriesInterval>
> {
  @ModelProperty({
    key: 'metric',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: ExploreSelectionSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public specification!: ExploreSpecification;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  public getData(): Observable<MetricSeriesDataFetcher<MetricTimeseriesInterval>> {
    return of({
      getData: interval => this.getAllData(interval)
    });
  }

  private getAllData(interval: TimeDuration): Observable<MetricSeries<MetricTimeseriesInterval>> {
    return forkJoinSafeEmpty({
      intervals: this.getSeries(interval),
      units: this.getUnits()
    }).pipe(
      map(obj => ({
        intervals: obj.intervals,
        units: obj.units
      }))
    );
  }

  private getUnits(): Observable<string> {
    return this.metadataService
      .getAttribute(ObservabilityTraceType.Api, this.specification.name)
      .pipe(map(attribute => attribute.units));
  }

  private getSeries(interval: TimeDuration): Observable<MetricTimeseriesInterval[]> {
    return this.fetchSpecificationData(interval).pipe(
      map((results: GraphQlExploreResult[]) =>
        results.map(result => ({
          timestamp: result[GQL_EXPLORE_RESULT_INTERVAL_KEY] as Date,
          value: result[this.specification.resultAlias()].value as number
        }))
      )
    );
  }
}
