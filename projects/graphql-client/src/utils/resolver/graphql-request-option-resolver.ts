import { GraphQlRequestOptions } from '../../graphql-config';

export class GraphQlRequestOptionResolver {
  public constructor(private readonly defaultOptions: GraphQlRequestOptions) {}

  public groupQueriesByResolvedOptions(
    ...requests: GraphQlRequestWithOptions[]
  ): Map<GraphQlRequestOptions, GraphQlRequestWithMetadata[]> {
    return requests
      .map(request => this.resolveOptions(request))
      .reduce((resolvedMap, request) => {
        const entryToUpdate = Array.from(resolvedMap).find(([options]) =>
          this.areOptionsCompatible(options, request.options)
        ) || [request.options, []];

        entryToUpdate[1].push({ request: request.request, name: request.options.name });
        resolvedMap.set(...entryToUpdate);

        return resolvedMap;
      }, new Map<GraphQlRequestOptions, GraphQlRequestWithMetadata[]>());
  }

  private areOptionsCompatible(first: GraphQlRequestOptions, second: GraphQlRequestOptions): boolean {
    return first.cacheability === second.cacheability;
  }

  private resolveOptions(request: GraphQlRequestWithOptions): GraphQlRequestWithMergedOptions {
    return {
      request: request.request,
      options: {
        ...this.defaultOptions,
        ...(request.handlerOptions || {}),
        ...(request.requestOptions || {})
      }
    };
  }
}

type GraphQlRequest = unknown;

interface GraphQlRequestWithMergedOptions {
  request: GraphQlRequest;
  options: GraphQlRequestOptions;
}

export interface GraphQlRequestWithOptions {
  request: GraphQlRequest;
  handlerOptions?: GraphQlRequestOptions;
  requestOptions?: GraphQlRequestOptions;
}

export interface GraphQlRequestWithMetadata {
  request: GraphQlRequest;
  name?: string;
}
