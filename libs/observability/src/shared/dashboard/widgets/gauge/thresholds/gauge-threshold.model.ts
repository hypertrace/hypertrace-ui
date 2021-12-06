import { Model, ModelProperty, NUMBER_PROPERTY, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'gauge-threshold'
})
export class GaugeThresholdModel {
  @ModelProperty({
    key: 'start',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public start!: number;

  @ModelProperty({
    key: 'end',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public end!: number;

  @ModelProperty({
    key: 'label',
    type: STRING_PROPERTY.type,
    required: true
  })
  public label!: string;

  @ModelProperty({
    key: 'color',
    type: UNKNOWN_PROPERTY.type,
    required: true
  })
  public color!: string;
}
