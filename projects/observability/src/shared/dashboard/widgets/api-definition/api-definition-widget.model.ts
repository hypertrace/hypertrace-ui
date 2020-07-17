import { Model, ModelApi } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { ApiDefinitionData, ApiDefinitionDataSourceModel } from './data/api-definition-data-source.model';

@Model({
  type: 'trace-api-definition-widget',
  supportedDataSourceTypes: [ApiDefinitionDataSourceModel]
})
export class ApiDefinitionWidgetModel {
  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<ApiDefinitionData> {
    return this.api.getData<ApiDefinitionData>();
  }
}
