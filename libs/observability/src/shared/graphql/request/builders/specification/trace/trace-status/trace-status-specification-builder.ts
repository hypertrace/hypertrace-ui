import { Dictionary } from '@hypertrace/common';
import { GraphQlSelection } from '@hypertrace/graphql-client';
import { TraceStatus, TraceStatusType } from '../../../../../model/schema/trace';
import { TraceStatusSpecification } from '../../../../../model/specifications/trace-status-specification';
import { GraphQlArgumentBuilder } from '../../../argument/graphql-argument-builder';

export class TraceStatusSpecificationBuilder {
  private static readonly STATUS_FIELD: string = 'status';
  private static readonly STATUS_CODE_FIELD: string = 'statusCode';
  private static readonly STATUS_MESSAGE_FIELD: string = 'statusMessage';

  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();

  public build(): TraceStatusSpecification {
    return {
      resultAlias: () => '_traceStatus',
      name: TraceStatusSpecificationBuilder.STATUS_CODE_FIELD,
      asGraphQlSelections: () => this.buildGraphQlSelections(),
      extractFromServerData: serverData => this.extractFromServerData(serverData),
      asGraphQlOrderByFragment: () => ({ expression: { key: TraceStatusSpecificationBuilder.STATUS_CODE_FIELD } })
    };
  }

  private buildGraphQlSelections(): GraphQlSelection[] {
    return [
      {
        path: 'attribute',
        alias: TraceStatusSpecificationBuilder.STATUS_FIELD,
        arguments: [this.argBuilder.forAttributeKey(TraceStatusSpecificationBuilder.STATUS_FIELD)]
      },
      {
        path: 'attribute',
        alias: TraceStatusSpecificationBuilder.STATUS_CODE_FIELD,
        arguments: [this.argBuilder.forAttributeKey(TraceStatusSpecificationBuilder.STATUS_CODE_FIELD)]
      },
      {
        path: 'attribute',
        alias: TraceStatusSpecificationBuilder.STATUS_MESSAGE_FIELD,
        arguments: [this.argBuilder.forAttributeKey(TraceStatusSpecificationBuilder.STATUS_MESSAGE_FIELD)]
      }
    ];
  }

  private extractFromServerData(serverData: Dictionary<unknown>): TraceStatus {
    return {
      status: serverData[TraceStatusSpecificationBuilder.STATUS_FIELD] as TraceStatusType,
      statusCode: serverData[TraceStatusSpecificationBuilder.STATUS_CODE_FIELD] as string,
      statusMessage: serverData[TraceStatusSpecificationBuilder.STATUS_MESSAGE_FIELD] as string
    };
  }
}
