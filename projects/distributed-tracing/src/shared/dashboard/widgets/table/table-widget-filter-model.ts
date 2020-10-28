import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlArgumentArray, GraphQlArgumentObject, GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlOperatorType } from '../../../graphql/model/schema/filter/graphql-filter';

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
    type: STRING_PROPERTY.type
  })
  public attribute?: string;

  @ModelProperty({
    key: 'operator',
    displayName: 'Operator',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        // Exclude operators for non-primitive values
        GraphQlOperatorType.Equals,
        GraphQlOperatorType.NotEquals,
        GraphQlOperatorType.LessThan,
        GraphQlOperatorType.LessThanOrEqualTo,
        GraphQlOperatorType.GreaterThan,
        GraphQlOperatorType.GreaterThanOrEqualTo,
        GraphQlOperatorType.Like
      ]
    } as EnumPropertyTypeInstance
  })
  public operator?: GraphQlOperatorType;

  @ModelProperty({
    key: 'value',
    displayName: 'Value',
    type: UNKNOWN_PROPERTY.type
  })
  public value?: Exclude<GraphQlArgumentValue, GraphQlArgumentObject | GraphQlArgumentArray>;
}
