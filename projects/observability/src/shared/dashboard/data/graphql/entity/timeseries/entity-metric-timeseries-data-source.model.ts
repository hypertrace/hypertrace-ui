import { TimeDuration } from '@hypertrace/common';
import { Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetricTimeseriesInterval } from '../../../../../graphql/model/metric/metric-timeseries';
import { MetricAggregation } from '../../../../../graphql/model/metrics/metric-aggregation';
import { ObservabilitySpecificationBuilder } from '../../../../../graphql/request/builders/selections/observability-specification-builder';
import { MetricSeries, MetricSeriesDataFetcher } from '../../../../widgets/charts/cartesian-widget/series.model';
import { MetricTimeseriesSpecificationModel } from '../../specifiers/metric-timeseries-specification.model';
import { EntityValueDataSourceModel } from '../entity-value-data-source.model';

@Model({
  type: 'entity-metric-timeseries-data-source'
})
export class EntityMetricTimeseriesDataSourceModel extends EntityValueDataSourceModel<
  MetricSeriesDataFetcher<MetricTimeseriesInterval>,
  MetricTimeseriesInterval[]
> {
  @ModelProperty({
    key: 'metric',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricTimeseriesSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public readonly specification!: MetricTimeseriesSpecificationModel;

  public getData(): Observable<MetricSeriesDataFetcher<MetricTimeseriesInterval>> {
    return of({
      getData: interval => this.getAllData(interval)
    });
  }

  private getAllData(interval: TimeDuration): Observable<MetricSeries<MetricTimeseriesInterval>> {
    return combineLatest([this.getSeries(interval), this.getSummary()]).pipe(
      map(([intervals, summary]) => ({
        intervals: intervals,
        summary: summary,
        units: summary.units !== undefined ? summary.units : ''
      }))
    );
  }

  private getSeries(interval: TimeDuration): Observable<MetricTimeseriesInterval[]> {
    return this.fetchSpecificationData(this.specification.withNewIntervalDuration(interval));
  }

  private getSummary(): Observable<MetricAggregation> {
    const spec = new ObservabilitySpecificationBuilder().metricAggregationSpecForKey(
      this.specification.metric,
      this.specification.aggregation
    );

    return this.fetchSpecificationData<MetricAggregation>(spec);
  }
}
