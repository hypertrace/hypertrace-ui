import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '../../properties/enums/enum-property-type';
import { PrimaryTextStyle } from './text-widget-types';

@Model({
  type: 'text-widget'
})
export class TextWidgetModel {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'text',
    required: false
  })
  public text?: string;

  @ModelProperty({
    key: 'secondary-text',
    type: STRING_PROPERTY.type,
    required: false
  })
  public secondaryText?: string;

  @ModelProperty({
    key: 'primary-text-style',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [PrimaryTextStyle.Title, PrimaryTextStyle.SectionTitle]
    } as EnumPropertyTypeInstance
  })
  public primaryTextStyle?: string = PrimaryTextStyle.Title;
}
