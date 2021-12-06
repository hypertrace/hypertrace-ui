import { Model, ModelApi, ModelJson, ModelProperty } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModelTemplatePropertyType } from '../../properties/property-types/model-template-type';

@Model({
  type: 'conditional'
})
export class ConditionalModel {
  @ModelProperty({
    key: 'true',
    type: ModelTemplatePropertyType.TYPE,
    required: true
  })
  public true!: ModelJson;

  @ModelProperty({
    key: 'false',
    type: ModelTemplatePropertyType.TYPE,
    required: true
  })
  public false!: ModelJson;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<boolean> {
    return this.api.getData<boolean>();
  }

  public getChildModel(): Observable<object> {
    return this.getData().pipe(map(result => this.api.createChild(result ? this.true : this.false)));
  }
}
