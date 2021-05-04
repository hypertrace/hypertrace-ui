import { Dictionary } from '@hypertrace/common';
import { Model, ModelApi } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';

@Model({
  type: 'log-detail-widget',
  supportedDataSourceTypes: []
})
export class LogDetailWidgetModel {
  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<Dictionary<unknown>> {
    return this.api.getData<Dictionary<unknown>>();
  }
}
