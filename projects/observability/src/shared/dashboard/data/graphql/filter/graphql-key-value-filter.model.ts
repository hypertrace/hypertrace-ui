import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlArgumentObject, GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { Model, ModelProperty, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlFieldFilter } from '../../../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../../../graphql/model/schema/filter/graphql-filter';
import { AttributeExpression } from './../../../../graphql/model/attribute/attribute-expression';

@Model({
  type: 'graphql-key-value-filter'
})
export class GraphQlKeyValueFilterModel implements GraphQlFilter {
  @ModelProperty({
    key: 'key',
    type: UNKNOWN_PROPERTY.type,
    required: true
  })
  public key!: AttributeExpression | string;

  @ModelProperty({
    key: 'operator',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      required: true,
      values: [
        GraphQlOperatorType.Equals,
        GraphQlOperatorType.NotEquals,
        GraphQlOperatorType.GreaterThan,
        GraphQlOperatorType.GreaterThanOrEqualTo,
        GraphQlOperatorType.In,
        GraphQlOperatorType.LessThan,
        GraphQlOperatorType.LessThanOrEqualTo,
        GraphQlOperatorType.Like,
        GraphQlOperatorType.NotIn,
        GraphQlOperatorType.ContainsKey
      ]
    } as EnumPropertyTypeInstance
  })
  public operator!: GraphQlOperatorType;

  @ModelProperty({
    key: 'value',
    required: true,
    type: UNKNOWN_PROPERTY.type
  })
  public value!: GraphQlArgumentValue;

  public asArgumentObjects(): GraphQlArgumentObject[] {
    return new GraphQlFieldFilter(this.key, this.operator, this.value).asArgumentObjects();
  }
}
