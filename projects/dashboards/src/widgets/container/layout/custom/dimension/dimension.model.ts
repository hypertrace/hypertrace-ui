import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '../../../../../properties/enums/enum-property-type';

export enum DimensionUnit {
  Px = 'PX',
  Fr = 'FR'
}

@Model({
  type: 'dimension-model'
})
export class DimensionModel {
  @ModelProperty({
    key: 'dimension',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public dimension!: number;

  @ModelProperty({
    key: 'unit',
    required: true,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [DimensionUnit.Px, DimensionUnit.Fr]
    } as EnumPropertyTypeInstance
  })
  public unit!: DimensionUnit;

  @ModelProperty({
    key: 'min-dimension',
    type: NUMBER_PROPERTY.type,
    required: false
  })
  public minDimension: number = 50;

  @ModelProperty({
    key: 'min-dimension-unit',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [DimensionUnit.Px]
    } as EnumPropertyTypeInstance
  })
  public minDimensionUnit: DimensionUnit = DimensionUnit.Px;

  public toString(): string {
    if (this.unit === DimensionUnit.Fr) {
      return `minmax(${this.minDimension}px, ${this.dimension}fr)`;
    }

    return `${this.dimension}px`;
  }
}
