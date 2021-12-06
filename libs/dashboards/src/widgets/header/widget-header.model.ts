import { TitlePosition } from '@hypertrace/components';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '../../properties/enums/enum-property-type';
import { LinkWidgetModel } from '../link/link-widget.model';

@Model({
  type: 'widget-header'
})
export class WidgetHeaderModel {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'title',
    required: false
  })
  public title?: string;

  @ModelProperty({
    key: 'title-position',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [TitlePosition.Footer, TitlePosition.Header]
    } as EnumPropertyTypeInstance,
    required: false
  })
  public titlePosition?: TitlePosition;

  @ModelProperty({
    type: BOOLEAN_PROPERTY.type,
    key: 'hide-title',
    required: false
  })
  public hideTitle?: boolean;

  @ModelProperty({
    key: 'link',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: LinkWidgetModel
    } as ModelModelPropertyTypeInstance
  })
  public link?: LinkWidgetModel;
}
