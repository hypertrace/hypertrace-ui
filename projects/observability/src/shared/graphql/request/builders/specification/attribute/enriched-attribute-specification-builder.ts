import { Dictionary } from '@hypertrace/common';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import { EnrichedAttribute } from '../../../../model/schema/enriched-attribute';
import { EnrichedAttributeSpecification } from '../../../../model/specifications/enriched-attribute-specification';
import { GraphQlArgumentBuilder } from '../../argument/graphql-argument-builder';

export class EnrichedAttributeSpecificationBuilder {
  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();
  public build(attributeKey: string, units: string): EnrichedAttributeSpecification {
    return {
      resultAlias: () => attributeKey,
      name: attributeKey,
      asGraphQlSelections: () => this.buildGraphQlSelections(attributeKey),
      extractFromServerData: serverData => this.extractFromServerData(attributeKey, units, serverData),
      asGraphQlOrderByFragment: () => ({
        key: attributeKey
      })
    };
  }

  private buildGraphQlSelections(attributeKey: string): GraphQlSelection {
    return {
      path: 'attribute',
      alias: attributeKey,
      arguments: [this.argBuilder.forAttributeKey(attributeKey)]
    };
  }

  private extractFromServerData<T = unknown>(
    attributeKey: string,
    units: string,
    serverData: Dictionary<unknown>
  ): EnrichedAttribute<T> {
    return {
      value: serverData[attributeKey] as T,
      units: units
    };
  }
}
