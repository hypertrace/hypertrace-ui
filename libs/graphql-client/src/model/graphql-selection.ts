import { GraphQlArgument } from './graphql-argument';

export interface GraphQlSelection {
  path: string;
  arguments?: GraphQlArgument[];
  children?: GraphQlSelection[];
  alias?: string;
}
