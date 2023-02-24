import { GraphQlArgumentObject, GraphQlArgumentValue, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { isEmpty } from 'lodash-es';
import { AttributeExpression } from '../../../attribute/attribute-expression';
import { GraphQlFilter, GraphQlFilterType, GraphQlOperatorType } from '../graphql-filter';

export class GraphQlFieldFilter implements GraphQlFilter {
  public constructor(
    public readonly keyOrExpression: string | AttributeExpression,
    public readonly operator: GraphQlOperatorType,
    public readonly value: GraphQlArgumentValue
  ) {}

  public asArgumentObjects(): FieldFilter[] {
    return [
      {
        keyExpression: this.normalizeExpression(this.keyOrExpression),
        operator: new GraphQlEnumArgument(this.operator),
        value: this.value,
        type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
      }
    ];
  }

  private normalizeExpression(
    keyOrExpression: string | AttributeExpression
  ): AttributeExpression & GraphQlArgumentObject {
    if (typeof keyOrExpression === 'string') {
      return {
        key: keyOrExpression
      };
    }

    return {
      key: keyOrExpression.key,
      ...(!isEmpty(keyOrExpression.subpath) ? { subpath: keyOrExpression.subpath } : {})
    };
  }
}

// tslint:disable-next-line: interface-over-type-literal https://github.com/Microsoft/TypeScript/issues/15300
type FieldFilter = {
  keyExpression: AttributeExpression & GraphQlArgumentObject;
  value: GraphQlArgumentValue;
  operator: GraphQlEnumArgument<GraphQlOperatorType>;
  type: GraphQlEnumArgument<GraphQlFilterType>;
};
