import { Dictionary } from '@hypertrace/common';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import { isEmpty } from 'lodash-es';
import {
  Entity,
  entityIdKey,
  EntityType,
  entityTypeKey,
  ObservabilityEntityType,
} from '../../../../model/schema/entity';
import { EntitySpecification } from '../../../../model/schema/specifications/entity-specification';
import { GraphQlArgumentBuilder } from '../../argument/graphql-argument-builder';
import { Specification } from './../../../../model/schema/specifier/specification';

export class EntitySpecificationBuilder {
  private static readonly DEFAULT_TYPE_FIELD: string = 'type';

  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();

  public build(
    idKey: string,
    nameKey: string,
    entityType?: EntityType,
    additionalAttributes: string[] = [],
    additionalSpecifications: Specification[] = [],
    aliasSuffix: string = '',
  ): EntitySpecification {
    return {
      resultAlias: () => this.buildResultAlias(idKey, nameKey, entityType, aliasSuffix),
      name: idKey,
      asGraphQlSelections: () =>
        this.buildGraphQlSelections(
          idKey,
          nameKey,
          entityType === undefined,
          additionalAttributes,
          additionalSpecifications,
        ),
      extractFromServerData: serverData =>
        this.extractFromServerData(
          serverData,
          idKey,
          nameKey,
          entityType,
          additionalAttributes,
          additionalSpecifications,
        ),
      asGraphQlOrderByFragment: () => ({
        expression: { key: nameKey },
      }),
    };
  }

  public buildResultAlias(idKey: string, nameKey: string, entityType?: EntityType, aliasSuffix: string = ''): string {
    return `entity_${idKey}_${nameKey}_${entityType === undefined ? 'unknownType' : entityType}${
      !isEmpty(aliasSuffix) ? '_' : ''
    }${aliasSuffix}`;
  }

  private buildGraphQlSelections(
    idKey: string,
    nameKey: string,
    withEntityType: boolean,
    additionalAttributes: string[] = [],
    additionalSpecifications: Specification[] = [],
  ): GraphQlSelection[] {
    const graphqlSelections: GraphQlSelection[] = [
      {
        path: 'attribute',
        alias: idKey,
        arguments: [this.argBuilder.forAttributeKey(idKey)],
      },
      {
        path: 'attribute',
        alias: nameKey,
        arguments: [this.argBuilder.forAttributeKey(nameKey)],
      },
      ...additionalAttributes.map(attribute => ({
        path: 'attribute',
        alias: attribute,
        arguments: [this.argBuilder.forAttributeKey(attribute)],
      })),
      ...additionalSpecifications.map(specification => specification.asGraphQlSelections()).flat(),
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
    additionalAttributes: string[] = [],
    additionalSpecifications: Specification[] = [],
  ): Entity {
    let entity = {
      [entityIdKey]: serverData[idKey] as string,
      [entityTypeKey]: entityType !== undefined ? entityType : this.extractEntityType(serverData),
      name: serverData[nameKey] as string,
    };
    additionalAttributes.forEach(attribute => {
      entity = { ...entity, [attribute]: serverData[attribute] };
    });

    additionalSpecifications.forEach(specification => {
      entity = { ...entity, [specification.name]: specification.extractFromServerData(serverData) };
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
