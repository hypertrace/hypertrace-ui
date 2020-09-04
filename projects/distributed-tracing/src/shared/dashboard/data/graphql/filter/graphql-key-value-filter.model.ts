import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlArgumentObject, GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlFieldFilter } from '../../../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../../../graphql/model/schema/filter/graphql-filter';

@Model({
  type: 'graphql-key-value-filter'
})
export class GraphQlKeyValueFilterModel implements GraphQlFilter {
  @ModelProperty({
    key: 'key',
    type: STRING_PROPERTY.type,
    required: true
  })
  public key!: string;

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
        GraphQlOperatorType.LessThan,
        GraphQlOperatorType.LessThanOrEqualTo,
        GraphQlOperatorType.Like,
        GraphQlOperatorType.ContainsKey,
        GraphQlOperatorType.ContainsKeyValue
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
