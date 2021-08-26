import { GraphQlArgumentValue, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlFilter, GraphQlFilterType, GraphQlOperatorType } from '../graphql-filter';

export class GraphQlIdFilter implements GraphQlFilter {
  public readonly key: string = 'id';

  public constructor(public readonly id: string, public readonly idScope: string) {}

  public asArgumentObjects(): [GraphQlIdFilterArgument] {
    return [
      {
        operator: new GraphQlEnumArgument(GraphQlOperatorType.Equals),
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
  operator: GraphQlEnumArgument<GraphQlOperatorType.Equals>;
  type: GraphQlEnumArgument<GraphQlFilterType.Id>;
  idType: GraphQlEnumArgument<string>;
};
