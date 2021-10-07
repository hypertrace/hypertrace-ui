import { Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { ApiTraceDetailData, ApiTraceDetailDataSourceModel } from './data/api-trace-detail-data-source.model';
import { TraceDetailData, TraceDetailDataSourceModel } from './data/trace-detail-data-source.model';

@Model({
  type: 'trace-detail-widget',
  supportedDataSourceTypes: [TraceDetailDataSourceModel, ApiTraceDetailDataSourceModel]
})
export class TraceDetailWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title: string = '';

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<TraceDetailData | ApiTraceDetailData> {
    return this.api.getData<TraceDetailData | ApiTraceDetailData>();
  }
}
