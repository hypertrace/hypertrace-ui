import { BOOLEAN_PROPERTY, Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
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

  @ModelProperty({
    key: 'showFilters',
    type: BOOLEAN_PROPERTY.type
  })
  public showFilters?: boolean;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<WaterfallData[]> {
    return this.api.getData<WaterfallData[]>();
  }
}
