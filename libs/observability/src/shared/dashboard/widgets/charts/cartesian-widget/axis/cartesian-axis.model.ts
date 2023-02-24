import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { BOOLEAN_PROPERTY, Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { Axis, ScaleType } from '../../../../../components/cartesian/chart';

@Model({
  type: 'cartesian-axis'
})
export class CartesianAxisModel {
  @ModelProperty({
    key: 'scale-type',
    required: false,
    displayName: 'Scale Type',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [ScaleType.Band, ScaleType.Linear, ScaleType.Time]
    } as EnumPropertyTypeInstance
  })
  public scale?: ScaleType;

  @ModelProperty({
    key: 'show-grid-lines',
    required: false,
    displayName: 'Show Grid Lines',
    type: BOOLEAN_PROPERTY.type
  })
  public showGridLines?: boolean;

  /**
   * The property acts as a maximum cap for smaller data values, so that the axis does not always treat
   * data max as the axis maximum
   */
  @ModelProperty({
    key: 'min-upper-limit',
    required: false,
    displayName: 'Minimum Upper Limit',
    type: NUMBER_PROPERTY.type
  })
  public minUpperLimit?: number;

  public getAxisOption(): Partial<Axis> {
    return {
      scale: this.scale,
      gridLines: this.showGridLines,
      max: this.minUpperLimit
    };
  }
}
