import { FilterOperator } from '@hypertrace/components';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'table-widget-filter',
  displayName: 'Filter'
})
export class TableWidgetFilterModel {
  @ModelProperty({
    key: 'label',
    displayName: 'Label',
    type: STRING_PROPERTY.type,
    required: true
  })
  public label!: string;

  @ModelProperty({
    key: 'attribute',
    displayName: 'Attribute',
    type: STRING_PROPERTY.type,
    required: true
  })
  public attribute!: string;

  @ModelProperty({
    key: 'operator',
    displayName: 'Operator',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        // Exclude operators for non-primitive values
        FilterOperator.Equals,
        FilterOperator.NotEquals,
        FilterOperator.LessThan,
        FilterOperator.LessThanOrEqualTo,
        FilterOperator.GreaterThan,
        FilterOperator.GreaterThanOrEqualTo,
        FilterOperator.In,
        FilterOperator.Like
      ]
    } as EnumPropertyTypeInstance,
    required: true
  })
  public operator!: FilterOperator;

  @ModelProperty({
    key: 'value',
    displayName: 'Value',
    type: UNKNOWN_PROPERTY.type,
    required: true
  })
  public value!: unknown;
}
