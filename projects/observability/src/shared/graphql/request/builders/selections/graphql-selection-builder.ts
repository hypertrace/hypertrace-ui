import { GraphQlSelection } from '@hypertrace/graphql-client';
import { Specification } from '../../../model/schema/specifier/specification';

export class GraphQlSelectionBuilder {
  public fromSpecifications(specifications: Specification[]): GraphQlSelection[] {
    return specifications.map(specification => specification.asGraphQlSelections()).flat();
  }
}
