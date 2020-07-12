import { Dictionary } from '@hypertrace/common';
import { GraphQlArgumentBuilder } from '@hypertrace/distributed-tracing';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import {
  Entity,
  entityIdKey,
  EntityType,
  entityTypeKey,
  ObservabilityEntityType
} from '../../../../model/schema/entity';
import { EntitySpecification } from '../../../../model/schema/specifications/entity-specification';

export class EntitySpecificationBuilder {
  private static readonly DEFAULT_TYPE_FIELD: string = 'type';

  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();

  public build(idKey: string, nameKey: string, entityType?: EntityType): EntitySpecification {
    return {
      resultAlias: () => this.buildResultAlias(idKey, nameKey, entityType),
      name: idKey,
      asGraphQlSelections: () => this.buildGraphQlSelections(idKey, nameKey, entityType === undefined),
      extractFromServerData: serverData => this.extractFromServerData(serverData, idKey, nameKey, entityType),
      asGraphQlOrderByFragment: () => ({
        key: nameKey
      })
    };
  }

  public buildResultAlias(idKey: string, nameKey: string, entityType?: EntityType): string {
    return `entity_${idKey}_${nameKey}_${entityType === undefined ? 'unknownType' : entityType}`;
  }

  private buildGraphQlSelections(idKey: string, nameKey: string, withEntityType: boolean): GraphQlSelection[] {
    const graphqlSelections: GraphQlSelection[] = [
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

    if (withEntityType) {
      graphqlSelections.push({ path: EntitySpecificationBuilder.DEFAULT_TYPE_FIELD });
    }

    return graphqlSelections;
  }

  private extractFromServerData(
    serverData: Dictionary<unknown>,
    idKey: string,
    nameKey: string,
    entityType?: EntityType
  ): Entity {
    return {
      [entityIdKey]: serverData[idKey] as string,
      [entityTypeKey]: entityType !== undefined ? entityType : this.extractEntityType(serverData),
      name: serverData[nameKey] as string
    };
  }

  private extractEntityType(serverData: Dictionary<unknown>): ObservabilityEntityType {
    const extractedType = serverData[EntitySpecificationBuilder.DEFAULT_TYPE_FIELD] as string | undefined;

    if (extractedType !== undefined) {
      return extractedType.toUpperCase() as ObservabilityEntityType;
    }

    throw new Error('Unable to extract Entity type');
  }
}
