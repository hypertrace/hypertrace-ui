import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlSortDirection } from './graphql-sort-direction';

export interface GraphQlSortArgument {
  direction: GraphQlEnumArgument<GraphQlSortDirection>;
  key: string;
}
