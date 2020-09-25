import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { GraphQlSelection } from './model/graphql-selection';

export const GRAPHQL_REQUEST_HANDLERS_TOKENS = new InjectionToken<unknown[][]>('GRAPHQL_REQUEST_HANDLERS_TOKENS');
export const GRAPHQL_URI = new InjectionToken<string>('GRAPHQL_URI');
export const GRAPHQL_BATCH_SIZE = new InjectionToken<string>('GRAPHQL_BATCH_SIZE');

export interface GraphQlHandler<TRequest, TResponse> {
  readonly type: GraphQlHandlerType;

  matchesRequest(request: unknown): request is TRequest;
  /**
   * Converts the provided request into a single selection, or a map of selections with arbitrary keys.
   * If a map is provided, the response provided to the converter will use the same keys to disambiguate
   * the response for each selection.
   */
  convertRequest(request: TRequest): GraphQlSelection | Map<unknown, GraphQlSelection>;
  /**
   * Converts the provided response, or map of responses (if a map of selections were provided in the request
   * conversion), to a response object.
   */
  convertResponse(response: unknown | Map<unknown, unknown>, request: TRequest): TResponse | Observable<TResponse>;

  getRequestOptions?(request: TRequest): GraphQlRequestOptions;
}

export interface GraphQlQueryHandler<TRequest, TResponse> extends GraphQlHandler<TRequest, TResponse> {
  readonly type: GraphQlHandlerType.Query;
}

export interface GraphQlMutationHandler<TRequest, TResponse> extends GraphQlHandler<TRequest, TResponse> {
  readonly type: GraphQlHandlerType.Mutation;
}

export interface GraphQlRequestOptions {
  cacheability: GraphQlRequestCacheability;
  isolated?: boolean;
}

export const enum GraphQlRequestCacheability {
  NotCacheable = 'no-cache', // Values used by apollo
  Cacheable = 'cache-first'
}

export const enum GraphQlHandlerType {
  Mutation = 'mutation',
  Query = 'query'
}
