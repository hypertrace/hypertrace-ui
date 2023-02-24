import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { AttributeExpression } from '../../attribute/attribute-expression';
import { GraphQlSortDirection } from './graphql-sort-direction';

export interface GraphQlSortArgument {
  direction: GraphQlEnumArgument<GraphQlSortDirection>;
  expression: AttributeExpression;
}
