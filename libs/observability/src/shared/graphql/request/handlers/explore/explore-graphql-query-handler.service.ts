import { Injectable } from '@angular/core';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { ExploreGraphqlQueryBuilderService } from './explore-graphql-query-builder.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResponse,
  GraphQlExploreServerResponse
} from './explore-query';

@Injectable({ providedIn: 'root' })
export class ExploreGraphQlQueryHandlerService
  implements GraphQlQueryHandler<GraphQlExploreRequest, GraphQlExploreResponse>
{
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  public constructor(private readonly exploreGraphQlQueryBuilderService: ExploreGraphqlQueryBuilderService) {}

  public matchesRequest(request: unknown): request is GraphQlExploreRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlExploreRequest>).requestType === EXPLORE_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlExploreRequest): GraphQlSelection {
    const totalSelection = request.includeTotal ? [{ path: 'total' }] : [];

    return {
      path: 'explore',
      arguments: this.exploreGraphQlQueryBuilderService.buildRequestArguments(request),
      children: [
        {
          path: 'results',
          children: this.exploreGraphQlQueryBuilderService.buildRequestSpecifications(request)
        },
        ...totalSelection
      ]
    };
  }

  public convertResponse(
    response: GraphQlExploreServerResponse,
    request: GraphQlExploreRequest
  ): GraphQlExploreResponse {
    return this.exploreGraphQlQueryBuilderService.buildResponse(response, request);
  }
}
