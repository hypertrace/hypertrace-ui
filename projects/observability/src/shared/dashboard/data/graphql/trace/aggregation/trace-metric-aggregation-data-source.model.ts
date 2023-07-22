import { Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetricAggregation } from '../../../../../graphql/model/metrics/metric-aggregation';
import { MetricHealth } from '../../../../../graphql/model/metrics/metric-health';
import { ExploreSpecification } from '../../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSelectionSpecificationModel } from '../../specifiers/explore-selection-specification.model';
import { TraceValueDataSourceModel } from '../trace-value-data-source.model';

@Model({
  type: 'trace-metric-aggregation-data-source'
})
export class TraceMetricAggregationDataSourceModel extends TraceValueDataSourceModel<MetricAggregation> {
  @ModelProperty({
    key: 'metric',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: ExploreSelectionSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public specification!: ExploreSpecification;

  public getData(): Observable<MetricAggregation> {
    return this.fetchSpecificationData().pipe(
      map(result => ({
        value: result.value as number,
        health: MetricHealth.NotSpecified,
        units: '' // TODO: pipe in units to result.units in explore-graphql-query-handler.service.ts
      }))
    );
  }
}
