import { GraphQlArgumentValue, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlFilter, GraphQlFilterType, GraphQlOperatorType } from '../graphql-filter';

export class GraphQlIdFilter implements GraphQlFilter {
  public readonly key: string = 'id';

  public constructor(
    public readonly id: string,
    public readonly idScope: string,
    public readonly operator: GraphQlOperatorType = GraphQlOperatorType.Equals
  ) {}

  public asArgumentObjects(): [GraphQlIdFilterArgument] {
    return [
      {
        operator: new GraphQlEnumArgument(this.operator),
        value: this.id,
        type: new GraphQlEnumArgument(GraphQlFilterType.Id),
        idType: new GraphQlEnumArgument(this.idScope)
      }
    ];
  }
}

// tslint:disable-next-line: interface-over-type-literal https://github.com/Microsoft/TypeScript/issues/15300
type GraphQlIdFilterArgument = {
  value: GraphQlArgumentValue;
  operator: GraphQlEnumArgument<GraphQlOperatorType>;
  type: GraphQlEnumArgument<GraphQlFilterType.Id>;
  idType: GraphQlEnumArgument<string>;
};
