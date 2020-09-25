import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { NetworkStatus } from '@apollo/client/core';
import { createHttpFactory, HttpMethod, SpectatorHttp } from '@ngneat/spectator/jest';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import {
  GraphQlHandlerType,
  GraphQlMutationHandler,
  GraphQlQueryHandler,
  GraphQlRequestCacheability,
  GraphQlRequestOptions,
  GRAPHQL_URI
} from './graphql-config';
import { GraphQlRequestService } from './graphql-request.service';
import { GraphQlModule } from './graphql.module';
import { GraphQlSelection } from './model/graphql-selection';

describe('GraphQl Request Service', () => {
  const graphQlUri = '/graphql';
  const TEST_REQUEST = Symbol('TEST_REQUEST');
  let spectator: SpectatorHttp<GraphQlRequestService>;
  const debounceTimeMs = 10;

  interface TestRequest {
    requestType: typeof TEST_REQUEST;
    select: GraphQlSelection;
  }

  const createService = createHttpFactory({
    service: GraphQlRequestService,
    imports: [GraphQlModule],
    providers: [{ provide: GRAPHQL_URI, useValue: graphQlUri }]
  });

  const buildRequest = (): TestRequest => ({
    requestType: TEST_REQUEST,
    select: { path: 'test', children: [{ path: 'id' }, { path: 'value' }] }
  });

  const buildServerResponse = () => ({
    data: {
      test: {
        id: 'foo',
        value: 'bar',
        __typename: 'test-type'
      }
    }
  });

  const mockQueryMethod = (): jest.SpyInstance =>
    jest.spyOn(spectator.inject(Apollo), 'query').mockReturnValueOnce(
      of({
        ...buildServerResponse(),
        networkStatus: NetworkStatus.ready,
        stale: false,
        loading: false
      })
    );

  const mockMutateMethod = (): jest.SpyInstance =>
    jest.spyOn(spectator.inject(Apollo), 'mutate').mockReturnValueOnce(
      of({
        ...buildServerResponse(),
        networkStatus: NetworkStatus.ready,
        stale: false,
        loading: false
      })
    );

  const buildQueryHandler = (requestOptions?: GraphQlRequestOptions): GraphQlQueryHandler<unknown, unknown> => ({
    type: GraphQlHandlerType.Query,
    // tslint:disable-next-line: no-any TS won't accept a mock for a type predicate
    matchesRequest: jest.fn(request => (request as { requestType: unknown }).requestType === TEST_REQUEST) as any,
    convertRequest: jest.fn((request: TestRequest) => request.select),
    convertResponse: jest.fn(response => response),
    getRequestOptions: requestOptions && jest.fn().mockReturnValue(requestOptions)
  });

  const buildMutationHandler = (requestOptions?: GraphQlRequestOptions): GraphQlMutationHandler<unknown, unknown> => ({
    type: GraphQlHandlerType.Mutation,
    // tslint:disable-next-line: no-any TS won't accept a mock for a type predicate
    matchesRequest: jest.fn(request => (request as { requestType: unknown }).requestType === TEST_REQUEST) as any,
    convertRequest: jest.fn((request: TestRequest) => request.select),
    convertResponse: jest.fn(response => response),
    getRequestOptions: requestOptions && jest.fn().mockReturnValue(requestOptions)
  });

  //
  beforeEach(() => {
    spectator = createService();
  });

  test('fires isolated queries without delay', () => {
    spectator.service.registerHandler(buildQueryHandler());
    const queryFnMock = mockQueryMethod();
    spectator.service.query(buildRequest(), { cacheability: GraphQlRequestCacheability.Cacheable, isolated: true });
    expect(queryFnMock).toHaveBeenCalled();
  });

  test('fires mutation requests immediately without delay', () => {
    spectator.service.registerHandler(buildMutationHandler());
    const mutateFnMock = mockMutateMethod();
    spectator.service.mutate(buildRequest());
    expect(mutateFnMock).toHaveBeenCalled();
  });

  test('collects and fires debounced queries together', fakeAsync(() => {
    spectator.service.registerHandler(buildQueryHandler());
    const queryFnMock = mockQueryMethod();
    spectator.service.query(buildRequest()).subscribe();
    spectator.service.query(buildRequest()).subscribe();
    expect(queryFnMock).not.toHaveBeenCalled();
    tick(debounceTimeMs);
    expect(queryFnMock).toHaveBeenCalledTimes(1);
  }));

  test('caches on identical queries', () => {
    spectator.service.registerHandler(buildQueryHandler());
    spectator.service.query(buildRequest()).subscribe();
    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    // Make second request
    spectator.service.query(buildRequest()).subscribe();
    // Verify no request sent
    spectator.controller.verify();
  });
  test('does not cache entities, even if they share an id', fakeAsync(() => {
    spectator.service.registerHandler(buildQueryHandler());
    spectator.service.query(buildRequest()).subscribe();
    // Return an object to be cached
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    // Make a new query, but tweak params so it's not cached and return same id with differen val
    const modifiedRequest = buildRequest();
    modifiedRequest.select.arguments = [{ name: 'a', value: 'b' }];
    spectator.service.query(modifiedRequest).subscribe();
    // Return a response with same id but different value
    const modifiedResponse = buildServerResponse();
    modifiedResponse.data.test.value = 'baz';
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(modifiedResponse);
    // Now make the first request again - it should be the original result
    spectator.service.query(buildRequest()).subscribe(result => {
      expect((result as { value: string }).value).toEqual('bar');
    });
    // Tick, our responses are always async
    tick();
  }));

  test('only fires queries that are subscribed', () => {
    spectator.service.registerHandler(buildQueryHandler());
    spectator.service.query(buildRequest());
    spectator.controller.expectNone(graphQlUri);
    spectator.service.query(buildRequest()).subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST);
  });

  test('supports custom request options from query request handlers', () => {
    const handler = buildQueryHandler({ cacheability: GraphQlRequestCacheability.NotCacheable });
    spectator.service.registerHandler(handler);
    spectator.service.query(buildRequest()).subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    // Make second identical request - should not be cached
    spectator.service.query(buildRequest()).subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    expect(handler.getRequestOptions).toHaveBeenCalledTimes(2);
  });

  test('supports custom request options from mutation request handlers', () => {
    const handler = buildMutationHandler({ cacheability: GraphQlRequestCacheability.NotCacheable });
    spectator.service.registerHandler(handler);
    spectator.service.mutate(buildRequest()).subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    // Make second identical request - should not be cached
    spectator.service.mutate(buildRequest()).subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    expect(handler.getRequestOptions).toHaveBeenCalledTimes(2);
  });

  test('late subscribers to a debounced query can access results', fakeAsync(() => {
    spectator.service.registerHandler(buildQueryHandler());
    const query$ = spectator.service.query(buildRequest());
    tick(50); // Late subscriber
    spectator.controller.expectNone(graphQlUri, HttpMethod.POST);
    let result;
    const subscription = query$.subscribe(res => (result = res));
    spectator.controller.expectNone(graphQlUri, HttpMethod.POST);
    tick(debounceTimeMs);
    spectator.controller.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    tick();
    expect(result).toEqual(expect.objectContaining({ id: 'foo' }));
    expect(subscription.closed).toBe(true);
  }));

  test('resubscribing to an immediate query triggers an immediate new request', () => {
    spectator.service.registerHandler(buildQueryHandler({ cacheability: GraphQlRequestCacheability.NotCacheable }));
    const query$ = spectator.service.query(buildRequest()); // ??Fix this
    query$.subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    query$.subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST);
  });

  test('resubscribing to a mutation triggers an immediate new request', () => {
    spectator.service.registerHandler(buildMutationHandler({ cacheability: GraphQlRequestCacheability.NotCacheable }));
    const mutate$ = spectator.service.mutate(buildRequest());
    mutate$.subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    mutate$.subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST);
  });

  test('supports custom request options on request', () => {
    spectator.service.registerHandler(buildQueryHandler({ cacheability: GraphQlRequestCacheability.NotCacheable }));
    spectator.service.query(buildRequest(), { cacheability: GraphQlRequestCacheability.Cacheable }).subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    // Make second request - should be cached
    spectator.service.query(buildRequest(), { cacheability: GraphQlRequestCacheability.Cacheable }).subscribe();
    spectator.controller.expectNone(graphQlUri, HttpMethod.POST);
    // Make third request but falling back to handler options now, shouldn't be cached
    spectator.service.query(buildRequest()).subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST);
  });

  test('resubscribing to a debounced query after execution triggers a debounced new request', fakeAsync(() => {
    spectator.service.registerHandler(buildQueryHandler({ cacheability: GraphQlRequestCacheability.NotCacheable }));
    const query$ = spectator.service.query(buildRequest());
    query$.subscribe();
    spectator.controller.expectNone(graphQlUri, HttpMethod.POST);
    tick(debounceTimeMs);
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    flushMicrotasks();
    // Now two more, should trigger one more request
    query$.subscribe();
    query$.subscribe();
    spectator.controller.expectNone(graphQlUri, HttpMethod.POST);
    tick(debounceTimeMs);
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    flushMicrotasks();
    // Now one last one, one more request
    query$.subscribe();
    spectator.controller.expectNone(graphQlUri, HttpMethod.POST);
    tick(debounceTimeMs);
    spectator.expectOne(graphQlUri, HttpMethod.POST);
  }));
});
