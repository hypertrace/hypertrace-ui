import { WidgetHeaderModel } from '@hypertrace/dashboards';
import {
  ARRAY_PROPERTY,
  Model,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType
} from '@hypertrace/hyperdash';
import { MODEL_API, ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { TopNDataSourceModel, TopNWidgetDataFetcher } from './data/top-n-data-source.model';
import { ExploreSelectionSpecificationModel } from '../../data/graphql/specifiers/explore-selection-specification.model';

@Model({
  type: 'top-n-widget',
  supportedDataSourceTypes: [TopNDataSourceModel]
})
export class TopNWidgetModel {
  @ModelProperty({
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: WidgetHeaderModel
    } as ModelModelPropertyTypeInstance,
    key: 'header',
    required: false
  })
  public header?: WidgetHeaderModel;

  @ModelProperty({
    type: ARRAY_PROPERTY.type,
    key: 'select-option-metrics',
    required: true
  })
  public optionMetricSpecifications!: ExploreSelectionSpecificationModel[];

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<TopNWidgetDataFetcher> {
    return this.api.getData<TopNWidgetDataFetcher>();
  }
}
