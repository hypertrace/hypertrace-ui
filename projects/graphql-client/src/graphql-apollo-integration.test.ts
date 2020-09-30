import { fakeAsync, flush, tick } from '@angular/core/testing';
import { createHttpFactory, HttpMethod, SpectatorHttp } from '@ngneat/spectator/jest';
import { Apollo, gql } from 'apollo-angular';
import { GRAPHQL_OPTIONS } from './graphql-config';
import { GraphQlModule } from './graphql.module';
import { GraphQlRequestBuilder } from './utils/builders/request/graphql-request-builder';

describe('GraphQl Apollo Integration Service', () => {
  const graphQlUri = '/graphql';
  const graphQlBatchSize = 1;
  let spectator: SpectatorHttp<Apollo>;

  const createService = createHttpFactory({
    service: Apollo,
    imports: [GraphQlModule],
    providers: [
      {
        provide: GRAPHQL_OPTIONS,
        useValue: {
          uri: graphQlUri,
          batchSize: graphQlBatchSize
        }
      }
    ]
  });

  const buildRequestString = (rootPath: string = 'test'): string =>
    new GraphQlRequestBuilder().withSelects({ path: rootPath, children: [{ path: 'id' }, { path: 'value' }] }).build();

  const buildServerResponse = (rootPath: string = 'test') => ({
    data: {
      [`${rootPath}`]: {
        id: 'foo',
        value: 'bar',
        __typename: 'test-type'
      }
    }
  });

  test('fires queries in batches', fakeAsync(() => {
    spectator = createService({
      providers: [
        {
          provide: GRAPHQL_OPTIONS,
          useValue: {
            uri: graphQlUri,
            batchSize: 2
          }
        }
      ]
    });

    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();

    // Make second request
    spectator.service
      .query({
        query: gql(buildRequestString('test2')),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();

    // // Only one http request should be fired

    let httpRequest = spectator.expectOne(graphQlUri, HttpMethod.POST).request;

    expect(httpRequest.body).toEqual([
      {
        variables: {},
        query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
      },
      {
        variables: {},
        query: '{\n  test2 {\n    id\n    value\n    __typename\n  }\n}\n'
      }
    ]);

    // Make third request
    spectator.service
      .query({
        query: gql(buildRequestString('test3')),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    tick();
    flush();
    httpRequest = spectator.expectOne(graphQlUri, HttpMethod.POST).request;

    expect(httpRequest.body).toEqual([
      {
        variables: {},
        query: '{\n  test3 {\n    id\n    value\n    __typename\n  }\n}\n'
      }
    ]);

    spectator.controller.verify();
  }));

  test('caches on identical queries', fakeAsync(() => {
    spectator = createService();
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());

    // Make second request
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    spectator.controller.verify();
    flush();
  }));

  test('should not cache on identical queries when no cache policy is selected', fakeAsync(() => {
    spectator = createService();
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());

    // Make second request
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'no-cache'
      })
      .subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    spectator.controller.verify();
    flush();
  }));

  test('only fires queries that are subscribed', fakeAsync(() => {
    spectator = createService();
    const query$ = spectator.service.query({
      query: gql(buildRequestString()),
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    });
    tick();
    spectator.controller.expectNone(graphQlUri);
    query$.subscribe();

    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    flush();
  }));

  // test('does not cache entities, even if they share an id', fakeAsync(() => {
  //   spectator.service.registerHandler(buildQueryHandler());
  //   spectator.service.queryImmediately(buildRequest()).subscribe();
  //   // Return an object to be cached
  //   spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
  //   // Make a new query, but tweak params so it's not cached and return same id with differen val
  //   const modifiedRequest = buildRequest();
  //   modifiedRequest.select.arguments = [{ name: 'a', value: 'b' }];
  //   spectator.service.queryImmediately(modifiedRequest).subscribe();
  //   // Return a response with same id but different value
  //   const modifiedResponse = buildServerResponse();
  //   modifiedResponse.data.test.value = 'baz';
  //   spectator.expectOne(graphQlUri, HttpMethod.POST).flush(modifiedResponse);
  //   // Now make the first request again - it should be the original result
  //   spectator.service.queryImmediately(buildRequest()).subscribe(result => {
  //     expect((result as { value: string }).value).toEqual('bar');
  //   });
  //   // Tick, our responses are always async
  //   tick();
  // }));

  // test('late subscribers to a debounced query can access results', fakeAsync(() => {
  //   spectator = createService();
  //   const query$ = spectator.service.query({
  //     query: gql(buildRequestString()),
  //     errorPolicy: 'all',
  //     fetchPolicy: 'no-cache'
  //   });
  //   tick();
  //   spectator.controller.expectNone(graphQlUri);

  //   tick(10);
  //   query$.subscribe();

  //   // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
  //   expect(spectator.expectOne(graphQlUri, HttpMethod.POST).request.body).toEqual([
  //     {
  //       variables: {},
  //       query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
  //     }
  //   ]);
  //   flush();
  // }));

  // test('resubscribing to a query triggers an immediate new request', fakeAsync(() => {
  //   spectator = createService();
  //   const query$ = spectator.service.query({
  //     query: gql(buildRequestString()),
  //     errorPolicy: 'all',
  //     fetchPolicy: 'no-cache'
  //   });
  //   query$.subscribe();
  //   tick();
  //   expect(spectator.expectOne(graphQlUri, HttpMethod.POST).request.body).toEqual([
  //     {
  //       variables: {},
  //       query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
  //     }
  //   ]);

  //   query$.subscribe();
  //   tick();
  //   flush();
  //   expect(spectator.expectOne(graphQlUri, HttpMethod.POST).request.body).toEqual([
  //     {
  //       variables: {},
  //       query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
  //     }
  //   ]);
  //   flush();
  // }));
});
