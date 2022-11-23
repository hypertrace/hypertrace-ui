import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'legend-widget'
})
export class LegendWidgetModel {
  @ModelProperty({
    type: STRING_PROPERTY.type,
    key: 'color',
    required: true
  })
  public color: string = '';

  @ModelProperty({
    key: 'displayText',
    type: STRING_PROPERTY.type,
    required: true
  })
  public displayText: string = '';

  @ModelProperty({
    key: 'prefixText',
    type: STRING_PROPERTY.type,
    required: false
  })
  public prefixText: string = '';

  @ModelProperty({
    key: 'suffixText',
    type: STRING_PROPERTY.type,
    required: false
  })
  public suffixText: string = '';
}
