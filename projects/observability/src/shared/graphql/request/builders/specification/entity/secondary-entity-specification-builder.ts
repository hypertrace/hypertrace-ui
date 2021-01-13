import { Dictionary } from '@hypertrace/common';
import { GraphQlArgumentBuilder } from '@hypertrace/distributed-tracing';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import { Entity, entityIdKey, EntityType, entityTypeKey } from '../../../../model/schema/entity';
import { EntitySpecification } from '../../../../model/schema/specifications/entity-specification';

export class SecondaryEntitySpecificationBuilder {
  /*
   * A secondary entity is composed entirely of attributes on the primary entity. A second fetch is not made, so
   * the primary entity must provide the attributes to build the secondary entity.
   */

  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();

  public build(idKey: string, nameKey: string, entityType: EntityType): EntitySpecification {
    return {
      resultAlias: () => '_secondaryEntity',
      name: idKey,
      asGraphQlSelections: () => this.buildGraphQlSelections(idKey, nameKey),
      extractFromServerData: serverData => this.extractFromServerData(serverData, idKey, nameKey, entityType),
      asGraphQlOrderByFragment: () => ({
        key: nameKey
      })
    };
  }

  private buildGraphQlSelections(idKey: string, nameKey: string): GraphQlSelection[] {
    return [
      {
        path: 'attribute',
        alias: idKey,
        arguments: [this.argBuilder.forAttributeKey(idKey)]
      },
      {
        path: 'attribute',
        alias: nameKey,
        arguments: [this.argBuilder.forAttributeKey(nameKey)]
      }
    ];
  }

  private extractFromServerData(
    serverData: Dictionary<unknown>,
    idKey: string,
    nameKey: string,
    entityType: EntityType
  ): Entity {
    return {
      [entityIdKey]: serverData[idKey] as string,
      [entityTypeKey]: entityType,
      name: serverData[nameKey] as string
    };
  }
}
