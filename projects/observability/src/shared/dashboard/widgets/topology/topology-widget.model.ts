import { BOOLEAN_PROPERTY, Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
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

  @ModelProperty({
    key: 'showLegend',
    displayName: 'Show Legend',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public showLegend?: boolean = true;

  @ModelProperty({
    key: 'showBrush',
    displayName: 'Show Brush',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public showBrush?: boolean = true;

  @ModelProperty({
    key: 'shouldAutoZoomToFit',
    displayName: 'Should Auto Zoom To Fit',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public shouldAutoZoomToFit?: boolean = false;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<TopologyData> {
    return this.api.getData();
  }
}
