import { Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { SpanDetailData, SpanDetailDataSourceModel } from './data/span-detail-data-source.model';

@Model({
  type: 'span-detail-widget',
  supportedDataSourceTypes: [SpanDetailDataSourceModel]
})
export class SpanDetailWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title: string = '';

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<SpanDetailData> {
    return this.api.getData<SpanDetailData>();
  }
}
