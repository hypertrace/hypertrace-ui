import { Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { GaugeWidgetData } from './gauge-widget';

@Model({
  type: 'gauge-widget'
})
export class GaugeWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title?: string;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<GaugeWidgetData> {
    return this.api.getData<GaugeWidgetData>();
  }
}
