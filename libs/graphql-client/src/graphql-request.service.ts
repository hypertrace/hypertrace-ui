import { Inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { includes, isNil, uniq } from 'lodash-es';
import { defer, EMPTY, Observable, Observer, of, Subject, zip } from 'rxjs';
import { buffer, catchError, debounceTime, filter, map, mergeMap, take, tap } from 'rxjs/operators';
import {
  GraphQlHandler,
  GraphQlHandlerType,
  GraphQlMutationHandler,
  GraphQlOptions,
  GraphQlQueryHandler,
  GraphQlRequestCacheability,
  GraphQlRequestOptions,
  GRAPHQL_OPTIONS
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
  private readonly defaultDebounceTimeMs: number = 10;
  private readonly queryHandlers: GraphQlHandler<unknown, unknown>[] = [];

  public constructor(private readonly apollo: Apollo, @Inject(GRAPHQL_OPTIONS) graphqlOptions: GraphQlOptions) {
    const requestSubject = new Subject<RequestWithOptions>();
    this.bufferedRequestObserver = requestSubject;
    requestSubject
      .pipe(
        buffer(requestSubject.pipe(debounceTime(graphqlOptions.batchDebounceTimeMs ?? this.defaultDebounceTimeMs))),
        map(requests => this.fireRequests(...requests))
      )
      .subscribe(this.bufferedResultStream);
  }

  public query<
    THandler extends GraphQlQueryHandler<unknown, unknown>,
    TResponse extends ResponseTypeForHandler<THandler> = ResponseTypeForHandler<THandler>
  >(request: RequestTypeForHandler<THandler>, requestOptions?: GraphQlRequestOptions): Observable<TResponse> {
    return requestOptions?.isolated
      ? this.queryIsolated(request, requestOptions)
      : this.queryDebounced(request, requestOptions);
  }

  private queryIsolated<
    THandler extends GraphQlQueryHandler<unknown, unknown>,
    TResponse extends ResponseTypeForHandler<THandler> = ResponseTypeForHandler<THandler>
  >(request: RequestTypeForHandler<THandler>, requestOptions?: GraphQlRequestOptions): Observable<TResponse> {
    return this.getResultFromMap(request, this.fireRequests({ request: request, options: requestOptions }));
  }

  private queryDebounced<
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
    const allSelections = allSelectionMaps.map(selectionMap => Array.from(selectionMap.values())).flat();
    const requestBuilder = new GraphQlRequestBuilder().withSelects(...allSelections);

    const selectionToRequestStringMap = requestBuilder.buildSelectionToGqlRequestStringMap();

    const requestStringToResponseMap = new Map(
      uniq(Array.from(selectionToRequestStringMap.values())).map(requestString => [
        requestString,
        this.executeRequest(requestString, type, options)
      ])
    );

    const selectionResponseMap = new Map(
      allSelections.map(selection => [
        selection,
        requestStringToResponseMap.get(selectionToRequestStringMap.get(selection)!)!
      ])
    );

    return this.buildResultMap(
      requests,
      this.buildResponseGetter(requestBuilder, selectionResponseMap, selectionMapByRequest)
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
      .pipe(
        tap(response => {
          if (!isNil(response.errors)) {
            // tslint:disable-next-line: no-console
            console.error(`Query response error(s) for request '${requestString}'`, response.errors);
          }
        }),
        map(response => response.data)
      );
  }

  private executeMutation<TResponse extends { [key: string]: unknown }>(requestString: string): Observable<TResponse> {
    return this.apollo
      .mutate<TResponse>({
        mutation: gql(`mutation ${requestString}`)
      })
      .pipe(
        tap(response => {
          if (!isNil(response.errors)) {
            // tslint:disable-next-line: no-console
            console.error(`Mutation response error(s) for request '${requestString}'`, response.errors);
          }
        }),
        mergeMap(response => (response.data ? of(response.data) : EMPTY))
      );
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
    queryBuilder: GraphQlRequestBuilder,
    selectionResponseMap: Map<GraphQlSelection, Observable<{ [key: string]: unknown }>>,
    selectionMultiMap: Map<GraphQlRequest, Map<unknown, GraphQlSelection>>
  ): ResponseGetter {
    return request => {
      const requestSelectionsMap = selectionMultiMap.get(request)!;

      return zip(
        ...Array.from(requestSelectionsMap.values()).map(selection => selectionResponseMap.get(selection)!)
      ).pipe(
        map(selectionResponses => Object.assign({}, ...selectionResponses)),
        map(response =>
          this.convertResponseForRequest(
            request,
            this.extractor.extractAll(requestSelectionsMap, queryBuilder, response)
          )
        ),
        mergeMap(convertedResponse =>
          convertedResponse instanceof Observable ? convertedResponse : of(convertedResponse)
        )
      );
    };
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
