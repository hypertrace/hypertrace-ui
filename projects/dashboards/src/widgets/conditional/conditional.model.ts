import { Model, ModelApi, ModelJson, ModelProperty, PLAIN_OBJECT_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Model({
  type: 'conditional'
})
export class ConditionalModel {
  @ModelProperty({
    key: 'true',
    type: PLAIN_OBJECT_PROPERTY.type,
    required: true
  })
  public true!: ModelJson;

  @ModelProperty({
    key: 'false',
    type: PLAIN_OBJECT_PROPERTY.type,
    required: true
  })
  public false!: ModelJson;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<boolean> {
    return this.api.getData<boolean>();
  }

  public getModel(): Observable<ModelJson> {
    return this.getData().pipe(map(result => (result ? this.true : this.false)));
  }
}
