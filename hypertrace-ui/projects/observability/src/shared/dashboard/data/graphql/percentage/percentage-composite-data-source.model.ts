import { forkJoinSafeEmpty, getPercentage } from '@hypertrace/common';
import { Model, ModelProperty, ModelPropertyType, ModelPropertyTypeInstance } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetricAggregation } from '../../../../graphql/model/metrics/metric-aggregation';
import { MetricHealth } from '../../../../graphql/model/metrics/metric-health';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
import { MetricAggregationDataSourceModel } from '../metric-aggregation/metric-aggregation-data-source.model';

@Model({
  type: 'percentage-composite-data-source',
})
export class PercentageCompositeDataSourceModel extends GraphQlDataSourceModel<MetricAggregation> {
  @ModelProperty({
    key: 'numerator',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricAggregationDataSourceModel,
    } as ModelPropertyTypeInstance,
    required: true,
  })
  public numerator!: MetricAggregationDataSourceModel;

  @ModelProperty({
    key: 'denominator',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricAggregationDataSourceModel,
    } as ModelPropertyTypeInstance,
    required: true,
  })
  public denominator!: MetricAggregationDataSourceModel;

  public getData(): Observable<MetricAggregation> {
    return forkJoinSafeEmpty([this.fetchNumeratorData(), this.fetchDenominatorData()]).pipe(
      map(results => ({
        value: getPercentage(results[0], results[1]),
        health: MetricHealth.NotSpecified,
        units: '%',
      })),
    );
  }

  private fetchNumeratorData(): Observable<number> {
    return this.numerator.getData().pipe(map(result => result.value));
  }

  private fetchDenominatorData(): Observable<number> {
    return this.denominator.getData().pipe(map(result => result.value));
  }
}
