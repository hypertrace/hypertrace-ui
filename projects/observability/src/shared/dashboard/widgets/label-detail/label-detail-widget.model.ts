import {
  UNKNOWN_PROPERTY,
  Model,
  ModelApi,
  ModelProperty,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { IconType } from '@hypertrace/assets-library';

@Model({
  type: 'label-detail-widget'
})
export class LabelDetailWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type,
    required: false
  })
  public title?: string;

  @ModelProperty({
    key: 'label',
    type: STRING_PROPERTY.type,
    required: true
  })
  public label!: string;

  @ModelProperty({
    key: 'icon',
    type: UNKNOWN_PROPERTY.type,
    required: true
  })
  public icon!: IconType;

  @ModelProperty({
    key: 'description',
    type: STRING_PROPERTY.type,
    required: false
  })
  public description?: string;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<string[]> {
    return this.api.getData<string[]>();
  }
}
