import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'highlighted-label-widget'
})
export class HighlightedLabelWidgetModel {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'label-template',
    required: true
  })
  public labelTemplate!: string;
}
