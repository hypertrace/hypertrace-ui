import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

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
}
