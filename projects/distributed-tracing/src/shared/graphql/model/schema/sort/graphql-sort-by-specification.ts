import { Specification } from '../specifier/specification';
import { GraphQlSortDirection } from './graphql-sort-direction';

export interface GraphQlSortBySpecification {
  direction: GraphQlSortDirection;
  key: Specification;
}
