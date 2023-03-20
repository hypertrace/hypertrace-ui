import { Dictionary } from '@hypertrace/common';
import { Specification } from '../../../model/schema/specifier/specification';
import { CompositeSpecification } from '../../../model/specifications/composite-specification';
import { TraceStatusSpecification } from '../../../model/specifications/trace-status-specification';
import { GraphQlArgumentBuilder } from '../argument/graphql-argument-builder';
import { GraphQlSelectionBuilder } from '../selections/graphql-selection-builder';
import { TraceStatusSpecificationBuilder } from './trace/trace-status/trace-status-specification-builder';

export class SpecificationBuilder {
  protected readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();
  protected readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();
  protected readonly traceStatusSpecBuilder: TraceStatusSpecificationBuilder = new TraceStatusSpecificationBuilder();

  /**
   * If specifications are of type Specification[] then extractFromServerData will return unknown[]
   * If specifications are of type Dictionary<Specification> then extractFromServerData will return Dictionary<unknown> with the exact mappings
   * TODO: Add Typings
   */
  public buildCompositeSpecification(
    specifications: Specification[] | Dictionary<Specification>,
    orderByKey: string
  ): CompositeSpecification {
    if (!Array.isArray(specifications)) {
      const specs = Object.values(specifications);
      const alias = this.buildSpecName(specs);

      return {
        resultAlias: () => alias,
        name: alias,
        asGraphQlSelections: () => this.selectionBuilder.fromSpecifications(specs),
        extractFromServerData: serverData => this.extractForSpecificationsObject(serverData, specifications),
        asGraphQlOrderByFragment: () => ({
          expression: { key: orderByKey }
        })
      };
    }

    const name = this.buildSpecName(specifications);

    return {
      resultAlias: () => name,
      name: name,
      asGraphQlSelections: () => this.selectionBuilder.fromSpecifications(specifications),
      extractFromServerData: serverData =>
        specifications.map(specification => specification.extractFromServerData(serverData)),
      asGraphQlOrderByFragment: () => ({
        expression: { key: orderByKey }
      })
    };
  }

  public buildTraceStatusSpecification(): TraceStatusSpecification {
    return this.traceStatusSpecBuilder.build();
  }

  public attributeSpecificationForKey(attributeKey: string): Specification {
    const queryAlias = attributeKey.replace(/[^\w]/gi, '_');

    return {
      resultAlias: () => attributeKey,
      name: attributeKey,
      asGraphQlSelections: () => ({
        path: 'attribute',
        alias: queryAlias,
        arguments: [this.argBuilder.forAttributeKey(attributeKey)]
      }),
      extractFromServerData: serverData => {
        const serverValue = serverData[queryAlias];

        return serverValue === 'null' ? undefined : serverValue;
      },
      asGraphQlOrderByFragment: () => ({
        expression: { key: attributeKey }
      })
    };
  }

  private buildSpecName(specs: Specification[]): string {
    return specs.map(specification => specification.resultAlias()).join('_');
  }

  private extractForSpecificationsObject(
    serverData: Dictionary<unknown>,
    specifications: Dictionary<Specification>
  ): Dictionary<unknown> {
    const extractedData: Dictionary<unknown> = {};
    const specs = Object.values(specifications);

    return Object.keys(specifications)
      .map((key, index) => [key, specs[index].extractFromServerData(serverData)] as [string, unknown])
      .reduce((acc, [key, value]) => {
	      return {
		      ...acc,
		      [key]: value
	      }
      }, extractedData);
  }
}
