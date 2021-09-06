import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlArgumentObject, GraphQlArgumentValue, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { Model, ModelProperty, STRING_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import {
  GraphQlFilter,
  GraphQlFilterType,
  GraphQlOperatorType
} from '../../../../graphql/model/schema/filter/graphql-filter';

@Model({
  type: 'graphql-id-scope-filter'
})
export class GraphqlIdScopeFilterModel implements GraphQlFilter {
  public readonly key: string = 'id';

  @ModelProperty({
    key: 'scope',
    type: STRING_PROPERTY.type,
    required: true
  })
  public scope!: string;

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
    return [
      {
        type: new GraphQlEnumArgument(GraphQlFilterType.Id),
        idType: new GraphQlEnumArgument(this.scope),
        operator: new GraphQlEnumArgument(this.operator),
        value: this.value
      }
    ];
  }
}
