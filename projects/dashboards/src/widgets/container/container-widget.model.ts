import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { AutoContainerLayoutModel } from './layout/auto/auto-container-layout.model';
import { ContainerLayout } from './layout/container-layout';

@Model({
  type: 'container-widget'
})
export class ContainerWidgetModel<TChild = object> {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'title',
    required: false
  })
  public title?: string;

  @ModelProperty({
    type: ARRAY_PROPERTY.type,
    key: 'children'
  })
  public children: TChild[] = [];

  @ModelProperty({
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: AutoContainerLayoutModel
    } as ModelModelPropertyTypeInstance,
    key: 'layout'
  })
  public layout!: ContainerLayout;
}
