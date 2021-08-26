import { GraphQlArgumentValue, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { GraphQlFilter, GraphQlFilterType, GraphQlOperatorType } from '@hypertrace/observability';
import { Entity, entityIdKey, EntityType, entityTypeKey } from '../../entity';

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

// tslint:disable-next-line: interface-over-type-literal https://github.com/Microsoft/TypeScript/issues/15300
type IdFilter = {
  value: GraphQlArgumentValue;
  operator: GraphQlEnumArgument<GraphQlOperatorType.Equals>;
  type: GraphQlEnumArgument<GraphQlFilterType.Id>;
  idType: GraphQlEnumArgument<EntityType>;
};
