import { GraphQlArgument } from './graphql-argument';

export interface GraphQlSelection {
  path: string;
  name?: string;
  arguments?: GraphQlArgument[];
  children?: GraphQlSelection[];
  alias?: string;
}
