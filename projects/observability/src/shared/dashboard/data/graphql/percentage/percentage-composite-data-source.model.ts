import { forkJoinSafeEmpty, getPercentage } from '@hypertrace/common';
import { GraphQlDataSourceModel, MetricAggregation, MetricHealth } from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, ModelPropertyType, ModelPropertyTypeInstance } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetricAggregationDataSourceModel } from '../metric-aggregation/metric-aggregation-data-source.model';

@Model({
  type: 'percentage-composite-data-source'
})
export class PercentageCompositeDataSourceModel extends GraphQlDataSourceModel<MetricAggregation> {
  @ModelProperty({
    key: 'numerator',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricAggregationDataSourceModel
    } as ModelPropertyTypeInstance,
    required: true
  })
  public numerator!: MetricAggregationDataSourceModel;

  @ModelProperty({
    key: 'denominator',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricAggregationDataSourceModel
    } as ModelPropertyTypeInstance,
    required: true
  })
  public denominator!: MetricAggregationDataSourceModel;

  public getData(): Observable<MetricAggregation> {
    return forkJoinSafeEmpty([this.fetchNumeratorData(), this.fetchDenominatorData()]).pipe(
      map(results => ({
        value: getPercentage(results[0], results[1]),
        health: MetricHealth.NotSpecified,
        units: '%'
      }))
    );
  }

  private fetchNumeratorData(): Observable<number> {
    return this.numerator.getData().pipe(map(result => result.value));
  }

  private fetchDenominatorData(): Observable<number> {
    return this.denominator.getData().pipe(map(result => result.value));
  }
}
