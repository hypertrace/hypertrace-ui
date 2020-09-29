import { Injector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { gql, NetworkStatus } from '@apollo/client/core';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import {
  GraphQlHandlerType,
  GraphQlMutationHandler,
  GraphQlQueryHandler,
  GraphQlRequestCacheability,
  GraphQlRequestOptions,
  GRAPHQL_OPTIONS
} from './graphql-config';
import { GraphQlRequestService } from './graphql-request.service';
import { GraphQlSelection } from './model/graphql-selection';
import { GraphQlRequestBuilder } from './utils/builders/request/graphql-request-builder';

describe('GraphQl Request Service', () => {
  const graphQlUri = '/graphql';
  const graphQlBatchSize = 1;

  const TEST_REQUEST_ONE = Symbol('TEST_REQUEST_ONE');
  let spectator: SpectatorService<GraphQlRequestService>;
  const debounceTimeMs = 10;

  interface TestRequestOne {
    requestType: typeof TEST_REQUEST_ONE;
    select: GraphQlSelection;
  }

  const TEST_REQUEST_TWO = Symbol('TWO');

  interface TestRequestTwo {
    requestType: typeof TEST_REQUEST_TWO;
    select: GraphQlSelection;
  }

  const buildServerResponse = () => ({
    data: {
      test: {
        id: 'foo',
        value: 'bar',
        __typename: 'test-type'
      }
    }
  });

  const createService = createServiceFactory({
    service: GraphQlRequestService,
    providers: [
      {
        provide: GRAPHQL_OPTIONS,
        useValue: {
          uri: graphQlUri,
          batchSize: graphQlBatchSize,
          batchDuration: debounceTimeMs
        }
      },
      {
        provide: Apollo,
        useValue: {
          query: jest.fn().mockReturnValueOnce(
            of({
              ...buildServerResponse(),
              networkStatus: NetworkStatus.ready,
              stale: false,
              loading: false
            })
          ),
          mutate: jest.fn().mockReturnValueOnce(
            of({
              ...buildServerResponse(),
              networkStatus: NetworkStatus.ready,
              stale: false,
              loading: false
            })
          )
        }
      },
      {
        provide: Injector,
        useValue: {
          get: () => []
        }
      }
    ]
  });

  const buildRequestOne = (valuePathName: string = 'value'): TestRequestOne => ({
    requestType: TEST_REQUEST_ONE,
    select: { path: 'testone', children: [{ path: 'id' }, { path: valuePathName }] }
  });

  const buildRequestTwo = (valuePathName: string = 'value'): TestRequestTwo => ({
    requestType: TEST_REQUEST_TWO,
    select: { path: 'testtwo', children: [{ path: 'id' }, { path: valuePathName }] }
  });

  const mockQueryMethod = (): jest.SpyInstance => {
    const queryMock = jest.spyOn(spectator.inject(Apollo), 'query').mockReturnValue(
      of({
        ...buildServerResponse(),
        networkStatus: NetworkStatus.ready,
        stale: false,
        loading: false
      })
    );
    queryMock.mockClear();

    return queryMock;
  };
  const mockMutateMethod = (): jest.SpyInstance =>
    jest.spyOn(spectator.inject(Apollo), 'mutate').mockReturnValue(
      of({
        ...buildServerResponse(),
        networkStatus: NetworkStatus.ready,
        stale: false,
        loading: false
      })
    );

  const buildQueryHandlerOne = (requestOptions?: GraphQlRequestOptions): GraphQlQueryHandler<unknown, unknown> => ({
    type: GraphQlHandlerType.Query,
    // tslint:disable-next-line: no-any TS won't accept a mock for a type predicate
    matchesRequest: jest.fn(request => (request as { requestType: unknown }).requestType === TEST_REQUEST_ONE) as any,
    convertRequest: jest.fn((request: TestRequestOne) => request.select),
    convertResponse: jest.fn(response => response),
    getRequestOptions: requestOptions && jest.fn().mockReturnValue(requestOptions)
  });

  const buildQueryHandlerTwo = (requestOptions?: GraphQlRequestOptions): GraphQlQueryHandler<unknown, unknown> => ({
    type: GraphQlHandlerType.Query,
    // tslint:disable-next-line: no-any TS won't accept a mock for a type predicate
    matchesRequest: jest.fn(request => (request as { requestType: unknown }).requestType === TEST_REQUEST_TWO) as any,
    convertRequest: jest.fn((request: TestRequestOne) => request.select),
    convertResponse: jest.fn(response => response),
    getRequestOptions: requestOptions && jest.fn().mockReturnValue(requestOptions)
  });

  const buildMutationHandlerOne = (
    requestOptions?: GraphQlRequestOptions
  ): GraphQlMutationHandler<unknown, unknown> => ({
    type: GraphQlHandlerType.Mutation,
    // tslint:disable-next-line: no-any TS won't accept a mock for a type predicate
    matchesRequest: jest.fn(request => (request as { requestType: unknown }).requestType === TEST_REQUEST_ONE) as any,
    convertRequest: jest.fn((request: TestRequestOne) => request.select),
    convertResponse: jest.fn(response => response),
    getRequestOptions: requestOptions && jest.fn().mockReturnValue(requestOptions)
  });

  //
  beforeEach(() => {
    spectator = createService();
  });

  test('fires isolated queries without delay', () => {
    spectator.service.registerHandler(buildQueryHandlerOne());
    const queryFnMock = mockQueryMethod();
    spectator.service.query(buildRequestOne(), { cacheability: GraphQlRequestCacheability.Cacheable, isolated: true });
    expect(queryFnMock).toHaveBeenCalled();
  });

  test('fires mutation requests immediately without delay', () => {
    spectator.service.registerHandler(buildMutationHandlerOne());
    const mutateFnMock = mockMutateMethod();
    spectator.service.mutate(buildRequestOne());
    expect(mutateFnMock).toHaveBeenCalled();
  });

  test('collects and fires different requests separately. Apollo bataches them', fakeAsync(() => {
    spectator.service.registerHandler(buildQueryHandlerOne());
    spectator.service.registerHandler(buildQueryHandlerTwo());
    const queryFnMock = mockQueryMethod();
    spectator.service.query(buildRequestOne()).subscribe();
    spectator.service.query(buildRequestTwo()).subscribe();
    tick(debounceTimeMs);
    expect(queryFnMock).toHaveBeenCalledTimes(2);
    expect(queryFnMock).toHaveBeenNthCalledWith(1, {
      query: gql(
        new GraphQlRequestBuilder()
          .withSelects({ path: 'testone', children: [{ path: 'id' }, { path: 'value' }] })
          .build()
      ),
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    });

    expect(queryFnMock).toHaveBeenNthCalledWith(2, {
      query: gql(
        new GraphQlRequestBuilder()
          .withSelects({ path: 'testtwo', children: [{ path: 'id' }, { path: 'value' }] })
          .build()
      ),
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    });
  }));

  test('only fires request for unique queries', fakeAsync(() => {
    spectator.service.registerHandler(buildQueryHandlerOne());
    const queryFnMock = mockQueryMethod();
    spectator.service.query(buildRequestOne()).subscribe();
    spectator.service.query(buildRequestOne()).subscribe();
    expect(queryFnMock).not.toHaveBeenCalled();
    tick(debounceTimeMs);
    expect(queryFnMock).toHaveBeenCalledTimes(1);
    expect(queryFnMock).toHaveBeenCalledWith({
      query: gql(
        new GraphQlRequestBuilder()
          .withSelects({ path: 'testone', children: [{ path: 'id' }, { path: 'value' }] })
          .build()
      ),
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    });
  }));

  test('merges requests together when possible', fakeAsync(() => {
    const queryFnMock = mockQueryMethod();
    queryFnMock.mockClear();
    spectator.service.registerHandler(buildQueryHandlerOne());
    spectator.service.query(buildRequestOne()).subscribe();
    spectator.service.query(buildRequestOne('value2')).subscribe();
    tick(debounceTimeMs);
    expect(queryFnMock).toHaveBeenCalledTimes(1);
    expect(queryFnMock).toHaveBeenCalledWith({
      query: gql(
        new GraphQlRequestBuilder()
          .withSelects({ path: 'testone', children: [{ path: 'id' }, { path: 'value' }, { path: 'value2' }] })
          .build()
      ),
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    });
  }));

  test('supports custom request options from query request handlers', fakeAsync(() => {
    const handler = buildQueryHandlerOne({ cacheability: GraphQlRequestCacheability.NotCacheable });
    spectator.service.registerHandler(handler);
    spectator.service.query(buildRequestOne()).subscribe();
    const queryFnMock = mockQueryMethod();
    tick(debounceTimeMs);
    expect(queryFnMock).toHaveBeenCalledWith({
      query: gql(
        new GraphQlRequestBuilder()
          .withSelects({ path: 'testone', children: [{ path: 'id' }, { path: 'value' }] })
          .build()
      ),
      errorPolicy: 'all',
      fetchPolicy: 'no-cache'
    });
    expect(handler.getRequestOptions).toHaveBeenCalledTimes(1);
  }));

  test('supports custom request options from mutation request handlers', fakeAsync(() => {
    const handler = buildMutationHandlerOne({ cacheability: GraphQlRequestCacheability.NotCacheable });
    spectator.service.registerHandler(handler);
    spectator.service.mutate(buildRequestOne()).subscribe();
    const mutateFnMock = mockMutateMethod();
    tick(debounceTimeMs);
    expect(mutateFnMock).toHaveBeenCalledWith({
      mutation: gql(
        `mutation ${new GraphQlRequestBuilder()
          .withSelects({ path: 'testone', children: [{ path: 'id' }, { path: 'value' }] })
          .build()}`
      )
    });
    expect(handler.getRequestOptions).toHaveBeenCalledTimes(1);
  }));

  test('supports custom request options on request', fakeAsync(() => {
    spectator.service.registerHandler(buildQueryHandlerOne({ cacheability: GraphQlRequestCacheability.NotCacheable }));
    const queryFnMock = mockQueryMethod();
    spectator.service.query(buildRequestOne(), { cacheability: GraphQlRequestCacheability.Cacheable }).subscribe();

    const requestString = new GraphQlRequestBuilder()
      .withSelects({ path: 'testone', children: [{ path: 'id' }, { path: 'value' }] })
      .build();
    tick(debounceTimeMs);
    expect(queryFnMock).toHaveBeenNthCalledWith(1, {
      query: gql(requestString),
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    });

    spectator.service.query(buildRequestOne()).subscribe();
    tick(debounceTimeMs);

    expect(queryFnMock).toHaveBeenNthCalledWith(2, {
      query: gql(requestString),
      errorPolicy: 'all',
      fetchPolicy: 'no-cache'
    });
  }));
});
