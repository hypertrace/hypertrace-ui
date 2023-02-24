import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'link-widget'
})
export class LinkWidgetModel {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'url',
    required: true
  })
  public url!: string;

  @ModelProperty({
    key: 'displayText',
    type: STRING_PROPERTY.type,
    required: false
  })
  public displayText?: string;
}
