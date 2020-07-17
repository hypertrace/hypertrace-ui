import { EnumPropertyTypeInstance, ENUM_TYPE, WidgetHeaderModel } from '@hypertrace/dashboards';
import {
  Model,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { Card, CardType } from './card';

@Model({
  type: 'card-list-widget'
})
export class CardListWidgetModel<T extends Card[]> {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type,
    required: false
  })
  public title?: string;

  @ModelProperty({
    key: 'card-type',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [CardType.Summary]
    } as EnumPropertyTypeInstance
  })
  public cardType?: CardType = CardType.Summary;

  @ModelProperty({
    key: 'header',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: WidgetHeaderModel
    } as ModelModelPropertyTypeInstance
  })
  public header?: WidgetHeaderModel;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<T> {
    return this.api.getData<T>();
  }
}
