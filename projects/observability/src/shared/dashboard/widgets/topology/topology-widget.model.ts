import { Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { MODEL_API, ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { TopologyData, TopologyDataSourceModel } from '../../data/graphql/topology/topology-data-source.model';

@Model({
  type: 'topology-widget',
  supportedDataSourceTypes: [TopologyDataSourceModel]
})
export class TopologyWidgetModel {
  @ModelProperty({
    key: 'title',
    displayName: 'Title',
    type: STRING_PROPERTY.type,
    required: false
  })
  public title?: string;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<TopologyData> {
    return this.api.getData();
  }
}
