import { GraphQlArgumentValue, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { Entity, entityIdKey, EntityType, entityTypeKey } from '../../entity';
import { GraphQlFilter, GraphQlFilterType, GraphQlOperatorType } from '../graphql-filter';

export class GraphQlEntityFilter implements GraphQlFilter {
  public static forEntity(entity: Entity): GraphQlEntityFilter {
    return new GraphQlEntityFilter(entity[entityIdKey], entity[entityTypeKey]);
  }
  public readonly key: string = 'id';

  public constructor(public readonly id: string, public readonly type: EntityType) {}

  public asArgumentObjects(): [IdFilter] {
    return [
      {
        operator: new GraphQlEnumArgument(GraphQlOperatorType.Equals),
        value: this.id,
        type: new GraphQlEnumArgument(GraphQlFilterType.Id),
        idType: new GraphQlEnumArgument(this.type)
      }
    ];
  }
}

export const findEntityFilterOrThrow = (filters: GraphQlFilter[]): GraphQlEntityFilter => {
  const entityFilter = filters.find((filter): filter is GraphQlEntityFilter => filter instanceof GraphQlEntityFilter);

  if (!entityFilter) {
    throw Error('Could not find entity filter in provided filters');
  }

  return entityFilter;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IdFilter = {
  value: GraphQlArgumentValue;
  operator: GraphQlEnumArgument<GraphQlOperatorType.Equals>;
  type: GraphQlEnumArgument<GraphQlFilterType.Id>;
  idType: GraphQlEnumArgument<EntityType>;
};
