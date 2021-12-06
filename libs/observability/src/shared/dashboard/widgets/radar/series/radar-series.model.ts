import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
@Model({
  type: 'radar-series'
})
export class RadarSeriesModel {
  @ModelProperty({
    key: 'name',
    type: STRING_PROPERTY.type,
    required: true
  })
  public name!: string;

  @ModelProperty({
    key: 'color',
    type: STRING_PROPERTY.type
  })
  public color: string = '';
}
