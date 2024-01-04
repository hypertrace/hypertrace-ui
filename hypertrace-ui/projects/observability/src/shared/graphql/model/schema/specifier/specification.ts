import { Dictionary } from '@hypertrace/common';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import { GraphQlSortWithoutDirection } from '../sort/graphql-sort-without-direction';

export interface Specification {
  resultAlias(): string;
  name: string;
  displayName?: string;
  asGraphQlSelections(): GraphQlSelection | GraphQlSelection[];
  asGraphQlOrderByFragment(): GraphQlSortWithoutDirection;
  extractFromServerData(resultContainer: Dictionary<unknown>): unknown;
}
