import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { includes } from 'lodash-es';
import { defer, EMPTY, Observable, Observer, of, Subject } from 'rxjs';
import { buffer, catchError, debounceTime, filter, map, mergeMap, take } from 'rxjs/operators';
import {
  GraphQlHandler,
  GraphQlHandlerType,
  GraphQlMutationHandler,
  GraphQlQueryHandler,
  GraphQlRequestCacheability,
  GraphQlRequestOptions
} from './graphql-config';
import { GraphQlSelection } from './model/graphql-selection';
import { GraphQlRequestBuilder } from './utils/builders/request/graphql-request-builder';
import { GraphQlDataExtractor } from './utils/extractor/graphql-data-extractor';
import { GraphQlRequestOptionResolver } from './utils/resolver/graphql-request-option-resolver';

@Injectable({ providedIn: 'root' })
export class GraphQlRequestService {
  private static readonly DEFAULT_SELECTION_KEY: unique symbol = Symbol('Default selection');
  private static readonly DEFAULT_REQUEST_OPTIONS: GraphQlRequestOptions = {
    cacheability: GraphQlRequestCacheability.Cacheable
  };
  private readonly extractor: GraphQlDataExtractor = new GraphQlDataExtractor();
  private readonly optionsResolver: GraphQlRequestOptionResolver = new GraphQlRequestOptionResolver(
    GraphQlRequestService.DEFAULT_REQUEST_OPTIONS
  );
  private readonly bufferedRequestObserver: Observer<RequestWithOptions>;
  private readonly bufferedResultStream: Subject<Map<GraphQlRequest, Observable<GraphQlResult>>> = new Subject();
  private readonly debounceTimeMs: number = 10;
  private readonly queryHandlers: GraphQlHandler<unknown, unknown>[] = [];

  public constructor(private readonly apollo: Apollo) {
    const requestSubject = new Subject<RequestWithOptions>();
    this.bufferedRequestObserver = requestSubject;
    requestSubject
      .pipe(
        buffer(requestSubject.pipe(debounceTime(this.debounceTimeMs))),
        map(requests => this.fireRequests(...requests))
      )
      .subscribe(this.bufferedResultStream);
  }

  public queryImmediately<
    THandler extends GraphQlQueryHandler<unknown, unknown>,
    TResponse extends ResponseTypeForHandler<THandler> = ResponseTypeForHandler<THandler>
  >(request: RequestTypeForHandler<THandler>, requestOptions?: GraphQlRequestOptions): Observable<TResponse> {
    return this.getResultFromMap(request, this.fireRequests({ request: request, options: requestOptions }));
  }

  public queryDebounced<
    THandler extends GraphQlQueryHandler<unknown, unknown>,
    TResponse extends ResponseTypeForHandler<THandler> = ResponseTypeForHandler<THandler>
  >(request: RequestTypeForHandler<THandler>, requestOptions?: GraphQlRequestOptions): Observable<TResponse> {
    return defer(() => {
      const uniqueRequest = { ...(request as object) };
      this.bufferedRequestObserver.next({ request: uniqueRequest, options: requestOptions });

      return this.getResultForRequest<TResponse>(uniqueRequest);
    });
  }

  public mutate<
    THandler extends GraphQlMutationHandler<unknown, unknown>,
    TResponse extends ResponseTypeForHandler<THandler> = ResponseTypeForHandler<THandler>
  >(request: RequestTypeForHandler<THandler>, requestOptions?: GraphQlRequestOptions): Observable<TResponse> {
    return this.getResultFromMap(request, this.fireRequests({ request: request, options: requestOptions }));
  }

  public registerHandler(handler: GraphQlHandler<unknown, unknown>): void {
    if (!includes(this.queryHandlers, handler)) {
      this.queryHandlers.push(handler);
    }
  }

  private fireRequests(...requests: RequestWithOptions[]): Map<GraphQlRequest, Observable<GraphQlResult>> {
    const requestTypeMap = this.groupQueriesByRequestType(requests);

    return new Map(
      Array.from(requestTypeMap).flatMap(([type, requestsWithOptionsForType]) => {
        const requestOptionMap = this.groupQueriesByRequestOptions(requestsWithOptionsForType);

        return Array.from(requestOptionMap).flatMap(([options, requestsForOptions]) =>
          Array.from(this.fireRequestBatch(requestsForOptions, type, options))
        );
      })
    );
  }

  private fireRequestBatch(
    requests: GraphQlRequest[],
    type: GraphQlHandlerType,
    options: GraphQlRequestOptions
  ): Map<GraphQlRequest, Observable<GraphQlResult>> {
    const selectionMapByRequest = this.buildSelectionMultiMap(requests);
    const allSelectionMaps = Array.from(selectionMapByRequest.values());
    const requestBuilder = new GraphQlRequestBuilder().withSelects(
      ...allSelectionMaps.map(selectionMap => Array.from(selectionMap.values())).flat()
    );

    return this.buildResultMap(
      requests,
      this.buildResponseGetter(
        this.executeRequest(requestBuilder.build(), type, options),
        requestBuilder,
        selectionMapByRequest
      )
    );
  }

  private executeRequest<TResponse extends { [key: string]: unknown }>(
    requestString: string,
    type: GraphQlHandlerType,
    options: GraphQlRequestOptions
  ): Observable<TResponse> {
    return type === GraphQlHandlerType.Mutation
      ? this.executeMutation(requestString)
      : this.executeQuery(requestString, options);
  }

  private executeQuery<TResponse extends { [key: string]: unknown }>(
    requestString: string,
    options: GraphQlRequestOptions
  ): Observable<TResponse> {
    return this.apollo
      .query<TResponse>({
        query: gql(requestString),
        errorPolicy: 'all',
        fetchPolicy: options.cacheability
      })
      .pipe(map(response => response.data));
  }

  private executeMutation<TResponse extends { [key: string]: unknown }>(requestString: string): Observable<TResponse> {
    return this.apollo
      .mutate<TResponse>({
        mutation: gql(`mutation ${requestString}`)
      })
      .pipe(mergeMap(response => (response.data ? of(response.data) : EMPTY)));
  }

  private getResultForRequest<T>(request: GraphQlRequest): Observable<T> {
    // TODO can extend this to better support streaming, etc.
    return this.bufferedResultStream.pipe(
      filter(resultMap => resultMap.has(request)),
      take(1),
      mergeMap(resultMap => this.getResultFromMap<T>(request, resultMap))
    );
  }

  private getResultFromMap<T>(
    request: GraphQlRequest,
    resultMap: Map<GraphQlRequest, Observable<GraphQlResult>>
  ): Observable<T> {
    return resultMap.get(request)!.pipe(
      map(result => {
        if (result.status === GraphQlResultStatus.Success) {
          return result.value as T;
        }

        const errorValue = String(result.value);
        // tslint:disable-next-line: no-console
        console.error(errorValue);

        throw Error(errorValue);
      })
    );
  }

  private buildSelectionMultiMap(requests: GraphQlRequest[]): Map<GraphQlRequest, Map<unknown, GraphQlSelection>> {
    return new Map(requests.map(request => [request, this.convertRequestToSelectionMap(request)]));
  }

  private convertRequestToSelectionMap(request: GraphQlRequest): Map<unknown, GraphQlSelection> {
    const selectionOrSelectionMap = this.findMatchingHandler(request).convertRequest(request);
    if (selectionOrSelectionMap instanceof Map) {
      return selectionOrSelectionMap;
    }

    return new Map([[GraphQlRequestService.DEFAULT_SELECTION_KEY, selectionOrSelectionMap]]);
  }

  private convertResponseForRequest(request: GraphQlRequest, response: Map<unknown, unknown>): unknown {
    const isDefaultMap = response.size === 1 && response.has(GraphQlRequestService.DEFAULT_SELECTION_KEY);
    const responseOrResponseMap = isDefaultMap ? response.get(GraphQlRequestService.DEFAULT_SELECTION_KEY) : response;

    return this.findMatchingHandler(request).convertResponse(responseOrResponseMap, request);
  }

  private findMatchingHandler(request: GraphQlRequest): GraphQlHandler<unknown, unknown> {
    const matchedHandler = this.queryHandlers.find(handler => handler.matchesRequest(request));
    if (matchedHandler) {
      return matchedHandler;
    }
    throw Error(
      `No matching request handler found for request: ${
        typeof request === 'object' ? JSON.stringify(request) : String(request)
      }`
    );
  }

  private buildResponseGetter(
    response$: Observable<{ [key: string]: unknown }>,
    queryBuilder: GraphQlRequestBuilder,
    selectionMultiMap: Map<GraphQlRequest, Map<unknown, GraphQlSelection>>
  ): ResponseGetter {
    return request =>
      response$.pipe(
        map(response =>
          this.convertResponseForRequest(
            request,
            this.extractor.extractAll(selectionMultiMap.get(request)!, queryBuilder, response)
          )
        ),
        mergeMap(convertedResponse =>
          convertedResponse instanceof Observable ? convertedResponse : of(convertedResponse)
        )
      );
  }

  private buildResultMap(
    requests: GraphQlRequest[],
    responseGetter: ResponseGetter
  ): Map<GraphQlRequest, Observable<GraphQlResult>> {
    return new Map(requests.map(request => this.buildRequestResponsePair(request, responseGetter)));
  }

  private buildRequestResponsePair(
    request: GraphQlRequest,
    responseGetter: ResponseGetter
  ): [GraphQlRequest, Observable<GraphQlResult>] {
    return [
      request,
      responseGetter(request).pipe(
        map(response => ({
          status: GraphQlResultStatus.Success,
          value: response
        })),
        catchError(err =>
          of({
            status: GraphQlResultStatus.Error,
            value: err
          })
        )
      )
    ];
  }

  private groupQueriesByRequestType(
    requestsWithOptions: RequestWithOptions[]
  ): Map<GraphQlHandlerType, RequestWithOptions[]> {
    return requestsWithOptions
      .map(
        requestWithOptions =>
          [requestWithOptions, this.findMatchingHandler(requestWithOptions.request).type] as [
            RequestWithOptions,
            GraphQlHandlerType
          ]
      )
      .reduce((resolvedMap, [requestWithOptions, type]) => {
        if (resolvedMap.has(type)) {
          const requests = resolvedMap.get(type)!;
          requests.push(requestWithOptions);
        } else {
          resolvedMap.set(type, [requestWithOptions]);
        }

        return resolvedMap;
      }, new Map<GraphQlHandlerType, RequestWithOptions[]>());
  }

  private groupQueriesByRequestOptions(
    requestsWithOptions: RequestWithOptions[]
  ): Map<GraphQlRequestOptions, GraphQlRequest[]> {
    return this.optionsResolver.groupQueriesByResolvedOptions(
      ...requestsWithOptions
        .map(requestWithOptions => [requestWithOptions, this.findMatchingHandler(requestWithOptions.request)] as const)
        .map(([requestWithOptions, handler]) => ({
          request: requestWithOptions.request,
          requestOptions: requestWithOptions.options,
          handlerOptions: handler.getRequestOptions && handler.getRequestOptions(requestWithOptions.request)
        }))
    );
  }
}

const enum GraphQlResultStatus {
  Success = 'SUCCESS',
  Error = 'ERROR'
}

interface GraphQlResult {
  status: GraphQlResultStatus;
  value: unknown;
}

interface RequestWithOptions {
  request: GraphQlRequest;
  options?: GraphQlRequestOptions;
}

type ResponseGetter = (request: unknown) => Observable<unknown>;

type GraphQlRequest = unknown;

export type RequestTypeForHandler<T extends GraphQlHandler<unknown, unknown>> = T extends GraphQlHandler<
  infer TRequest,
  unknown
>
  ? TRequest
  : never;

export type ResponseTypeForHandler<T extends GraphQlHandler<unknown, unknown>> = T extends GraphQlHandler<
  unknown,
  infer TResponse
>
  ? TResponse
  : never;
