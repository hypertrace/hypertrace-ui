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

  public buildCompositeSpecification(specifications: Specification[], orderByKey: string): CompositeSpecification {
    const name = specifications.map(specification => specification.resultAlias()).join('_');

    return {
      resultAlias: () => name,
      name: name,
      asGraphQlSelections: () => this.selectionBuilder.fromSpecifications(specifications),
      extractFromServerData: serverData =>
        specifications.map(specification => specification.extractFromServerData(serverData)),
      asGraphQlOrderByFragment: () => ({
        key: orderByKey
      })
    };
  }

  public buildTraceStatusSpecification(): TraceStatusSpecification {
    return this.traceStatusSpecBuilder.build();
  }

  public attributeSpecificationForKey(attributeKey: string): Specification {
    return {
      resultAlias: () => attributeKey,
      name: attributeKey,
      asGraphQlSelections: () => ({
        path: 'attribute',
        alias: attributeKey,
        arguments: [this.argBuilder.forAttributeKey(attributeKey)]
      }),
      extractFromServerData: serverData => {
        const serverValue = serverData[attributeKey];

        return serverValue === 'null' ? undefined : serverValue;
      },
      asGraphQlOrderByFragment: () => ({
        key: attributeKey
      })
    };
  }

  public fieldSpecificationForKey(field: string): Specification {
    return {
      resultAlias: () => field,
      name: field,
      asGraphQlSelections: () => ({
        path: field
      }),
      extractFromServerData: serverData => {
        const serverValue = serverData[field];

        return serverValue === 'null' ? undefined : serverValue;
      },
      asGraphQlOrderByFragment: () => ({
        key: field
      })
    };
  }
}
