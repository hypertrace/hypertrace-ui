import { Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { WaterfallData } from './waterfall/waterfall-chart';

@Model({
  type: 'waterfall-widget'
})
export class WaterfallWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title: string = '';

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<WaterfallData[]> {
    return this.api.getData<WaterfallData[]>();
  }
}
