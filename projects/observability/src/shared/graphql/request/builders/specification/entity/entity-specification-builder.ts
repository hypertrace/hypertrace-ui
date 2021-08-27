import { Dictionary } from '@hypertrace/common';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import {
  Entity,
  entityIdKey,
  EntityType,
  entityTypeKey,
  ObservabilityEntityType
} from '../../../../model/schema/entity';
import { EntitySpecification } from '../../../../model/schema/specifications/entity-specification';
import { GraphQlArgumentBuilder } from '../../argument/graphql-argument-builder';

export class EntitySpecificationBuilder {
  private static readonly DEFAULT_TYPE_FIELD: string = 'type';

  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();

  public build(
    idKey: string,
    nameKey: string,
    entityType?: EntityType,
    additionalAttributes: string[] = []
  ): EntitySpecification {
    return {
      resultAlias: () => this.buildResultAlias(idKey, nameKey, entityType),
      name: idKey,
      asGraphQlSelections: () =>
        this.buildGraphQlSelections(idKey, nameKey, entityType === undefined, additionalAttributes),
      extractFromServerData: serverData =>
        this.extractFromServerData(serverData, idKey, nameKey, entityType, additionalAttributes),
      asGraphQlOrderByFragment: () => ({
        key: nameKey
      })
    };
  }

  public buildResultAlias(idKey: string, nameKey: string, entityType?: EntityType): string {
    return `entity_${idKey}_${nameKey}_${entityType === undefined ? 'unknownType' : entityType}`;
  }

  private buildGraphQlSelections(
    idKey: string,
    nameKey: string,
    withEntityType: boolean,
    additionalAttributes: string[] = []
  ): GraphQlSelection[] {
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
      },
      ...additionalAttributes.map(attribute => ({
        path: 'attribute',
        alias: attribute,
        arguments: [this.argBuilder.forAttributeKey(attribute)]
      }))
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
    entityType?: EntityType,
    additionalAttributes: string[] = []
  ): Entity {
    let entity = {
      [entityIdKey]: serverData[idKey] as string,
      [entityTypeKey]: entityType !== undefined ? entityType : this.extractEntityType(serverData),
      name: serverData[nameKey] as string
    };
    additionalAttributes.forEach(attribute => {
      entity = { ...entity, [attribute]: serverData[attribute] };
    });

    return entity;
  }

  private extractEntityType(serverData: Dictionary<unknown>): ObservabilityEntityType {
    const extractedType = serverData[EntitySpecificationBuilder.DEFAULT_TYPE_FIELD] as string | undefined;

    if (extractedType !== undefined) {
      return extractedType.toUpperCase() as ObservabilityEntityType;
    }

    throw new Error('Unable to extract Entity type');
  }
}
