import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '../../../../../properties/enums/enum-property-type';
import { CellDimension, DimensionUnit } from './dimension.model';

@Model({
  type: 'auto-dimension-model'
})
export class AutoDimensionModel implements CellDimension {
  @ModelProperty({
    key: 'max-dimension',
    type: NUMBER_PROPERTY.type,
    required: false
  })
  public maxDimension?: number;

  @ModelProperty({
    key: 'max-dimension-unit',
    required: false,
    type: {
      key: ENUM_TYPE.type,
      values: [DimensionUnit.Px]
    } as EnumPropertyTypeInstance
  })
  public maxDimensionUnit: DimensionUnit = DimensionUnit.Px;

  public getDimensionAsGridStyle(): string {
    if (this.maxDimension !== undefined) {
      return `minmax(auto, ${this.maxDimension}${this.maxDimensionUnit.toLowerCase()})`;
    }

    return 'auto';
  }
}
