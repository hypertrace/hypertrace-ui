import { TimeDuration, TimeUnit } from '@hypertrace/common';
import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '../../properties/enums/enum-property-type';

@Model({
  type: 'time-duration'
})
export class TimeDurationModel {
  @ModelProperty({
    key: 'value',
    required: true,
    type: NUMBER_PROPERTY.type
  })
  public value!: number;

  @ModelProperty({
    key: 'unit',
    required: true,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        TimeUnit.Millisecond,
        TimeUnit.Second,
        TimeUnit.Minute,
        TimeUnit.Hour,
        TimeUnit.Day,
        TimeUnit.Week,
        TimeUnit.Month
      ]
    } as EnumPropertyTypeInstance
  })
  public unit!: TimeUnit;

  public getDuration(): TimeDuration {
    return new TimeDuration(this.value, this.unit);
  }
}
