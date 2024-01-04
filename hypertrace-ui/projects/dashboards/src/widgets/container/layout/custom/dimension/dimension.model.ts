import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '../../../../../properties/enums/enum-property-type';

export enum DimensionUnit {
  Px = 'PX',
  Fr = 'FR',
}

@Model({
  type: 'dimension-model',
})
export class DimensionModel implements CellDimension {
  @ModelProperty({
    key: 'dimension',
    type: NUMBER_PROPERTY.type,
    required: true,
  })
  public dimension!: number;

  @ModelProperty({
    key: 'unit',
    required: true,
    type: {
      key: ENUM_TYPE.type,
      values: [DimensionUnit.Px, DimensionUnit.Fr],
    } as EnumPropertyTypeInstance,
  })
  public unit!: DimensionUnit;

  @ModelProperty({
    key: 'min-dimension',
    type: NUMBER_PROPERTY.type,
    required: false,
  })
  public minDimension: number = 50;

  @ModelProperty({
    key: 'min-dimension-unit',
    required: false,
    type: {
      key: ENUM_TYPE.type,
      values: [DimensionUnit.Px],
    } as EnumPropertyTypeInstance,
  })
  public minDimensionUnit: DimensionUnit = DimensionUnit.Px;

  public getDimensionAsGridStyle(): string {
    if (this.unit === DimensionUnit.Fr) {
      return `minmax(${this.minDimension}px, ${this.dimension}fr)`;
    }

    return `${this.dimension}px`;
  }
}

export interface CellDimension {
  getDimensionAsGridStyle(): string;
}
