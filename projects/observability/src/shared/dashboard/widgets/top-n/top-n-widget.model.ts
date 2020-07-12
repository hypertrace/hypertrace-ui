import { ARRAY_PROPERTY, Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { MODEL_API, ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { MetricAggregationSpecificationModel } from '../../data/graphql/specifiers/metric-aggregation-specification.model';
import { TopNDataSourceModel, TopNWidgetDataFetcher } from './data/top-n-data-source.model';

@Model({
  type: 'top-n-widget',
  supportedDataSourceTypes: [TopNDataSourceModel]
})
export class TopNWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title: string = '';

  @ModelProperty({
    type: ARRAY_PROPERTY.type,
    key: 'select-option-metrics',
    required: true
  })
  public optionMetricSpecifications!: MetricAggregationSpecificationModel[];

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<TopNWidgetDataFetcher> {
    return this.api.getData<TopNWidgetDataFetcher>();
  }
}
