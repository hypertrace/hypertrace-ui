import { kebabCase, uniqueId } from 'lodash-es';
import { Color } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY, NUMBER_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'topology-metric-category'
})
export class TopologyMetricCategoryModel implements TopologyMetricCategoryData {

  @ModelProperty({
    key: 'name',
    required: true,
    type: STRING_PROPERTY.type
  })
  public name!: string;

  @ModelProperty({
    key: 'minValue',
    required: true,
    type: NUMBER_PROPERTY.type
  })
  public minValue!: number;

  @ModelProperty({
    key: 'maxValue',
    required: false,
    type: NUMBER_PROPERTY.type
  })
  public maxValue?: number;

  @ModelProperty({
    key: 'fillColor',
    required: true,
    type: STRING_PROPERTY.type
  })
  public fillColor!: Color;

  @ModelProperty({
    key: 'strokeColor',
    required: true,
    type: STRING_PROPERTY.type
  })
  public strokeColor!: Color;

  @ModelProperty({
    key: 'focusColor',
    required: true,
    type: STRING_PROPERTY.type
  })
  public focusColor!: Color;

  private readonly id: string = uniqueId();

  public getCategoryClassName(): string {
    return `${kebabCase(this.name)}-${this.id}`;
  }
}

export interface TopologyMetricCategoryData {
  name: string;
  minValue: number;
  maxValue?: number;
  fillColor: string;
  strokeColor: string;
  focusColor: string;
  getCategoryClassName(): string;
}
