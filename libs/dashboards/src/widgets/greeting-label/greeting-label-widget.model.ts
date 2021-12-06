import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'greeting-label-widget'
})
export class GreetingLabelWidgetModel {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'suffix-label',
    required: true
  })
  public suffixLabel!: string;
}
