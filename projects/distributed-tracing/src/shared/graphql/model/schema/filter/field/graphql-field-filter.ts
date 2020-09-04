import { GraphQlArgumentValue, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlFilter, GraphQlFilterType, GraphQlOperatorType } from '../graphql-filter';

export class GraphQlFieldFilter implements GraphQlFilter {
  public constructor(
    public readonly key: string,
    public readonly operator: GraphQlOperatorType,
    public readonly value: GraphQlArgumentValue
  ) {}

  public asArgumentObjects(): FieldFilter[] {
    return [
      {
        key: this.key,
        operator: new GraphQlEnumArgument(this.operator),
        value: this.value,
        type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
      }
    ];
  }
}

// tslint:disable-next-line: interface-over-type-literal https://github.com/Microsoft/TypeScript/issues/15300
type FieldFilter = {
  key: string;
  value: GraphQlArgumentValue;
  operator: GraphQlEnumArgument<GraphQlOperatorType>;
  type: GraphQlEnumArgument<GraphQlFilterType>;
};
