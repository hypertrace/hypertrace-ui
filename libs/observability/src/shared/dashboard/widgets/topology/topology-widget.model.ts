import { LinkWidgetModel } from '@hypertrace/dashboards';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
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
    key: 'link',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: LinkWidgetModel
    } as ModelModelPropertyTypeInstance
  })
  public link?: LinkWidgetModel;

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

  @ModelProperty({
    key: 'enableBoxStyle',
    displayName: 'Enable Box Style',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public enableBoxStyle?: boolean = false;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<TopologyData> {
    return this.api.getData();
  }
}
